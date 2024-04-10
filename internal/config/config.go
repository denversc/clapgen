/*
 * Copyright 2024 Denver Coneybeare
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package config

import (
	_ "embed"
	"errors"
	"fmt"
	"github.com/dop251/goja"
	"log"
	"os"
	"unicode/utf8"
)

//go:embed sdk.js
var sdkJS string

const sdkJSFileName = "sdk.js"

func LoadConfig(configFilePath string) (*Config, error) {
	configFileBytes, err := os.ReadFile(configFilePath)
	if err != nil {
		return nil, fmt.Errorf("reading file failed: %v, (%w)", configFilePath, err)
	}
	if !utf8.Valid(configFileBytes) {
		return nil, fmt.Errorf("invalid UTF-8 encoded text in file: %v", configFilePath)
	}
	configFileText := string(configFileBytes)

	vm := goja.New()
	vm.SetFieldNameMapper(goja.TagFieldNameMapper("js", false))

	err = registerConsole(vm)
	if err != nil {
		return nil, fmt.Errorf("registering JavaScript 'console' object failed: %w", err)
	}

	err = runJs(sdkJSFileName, sdkJS, vm)
	if err != nil {
		return nil, err
	}

	err = runJs(configFilePath, configFileText, vm)
	if err != nil {
		return nil, err
	}

	return extractConfig(vm)
}

func runJs(name string, jsSource string, vm *goja.Runtime) error {
	program, err := goja.Compile(name, jsSource, true)
	if err != nil {
		return fmt.Errorf("JavaScript compilation failed: %v (%w)", name, err)
	}

	_, err = vm.RunProgram(program)
	if err != nil {
		var jsException *goja.Exception
		if errors.As(err, &jsException) {
			log.Println(jsException.String())
		}
		return fmt.Errorf("JavaScript execution failed: %v (%w)", name, err)
	}

	return nil
}

const initJsFunctionName = "clapgen_init"
const instanceJsPropertyName = "clapgenInstance"

func extractConfig(vm *goja.Runtime) (*Config, error) {
	var value goja.Value
	exception := vm.Try(func() {
		value = vm.Get(initJsFunctionName)
	})
	if exception != nil {
		log.Println(exception.String())
		return nil, fmt.Errorf("getting '%v' from JavaScript runtime failed: %w",
			initJsFunctionName, exception)
	}
	if value == nil {
		return nil, fmt.Errorf("'%v' not found in JavaScript runtime",
			initJsFunctionName)
	}

	var initFunction *goja.Object
	err := vm.ExportTo(value, &initFunction)
	if err != nil {
		return nil, fmt.Errorf("converting '%v' to an object failed: %w",
			initJsFunctionName, err)
	}

	exception = vm.Try(func() {
		value = initFunction.Get(instanceJsPropertyName)
	})
	if exception != nil {
		log.Println(exception.String())
		return nil, fmt.Errorf("getting %v.%v from JavaScript runtime failed: %w",
			initJsFunctionName, instanceJsPropertyName, exception)
	}
	if value == nil {
		return nil, fmt.Errorf("property not found: %v.%v (ensure that %v() was called exactly once)",
			initJsFunctionName, instanceJsPropertyName, initJsFunctionName)
	}

	var clapgenJsObject *goja.Object
	err = vm.ExportTo(value, &clapgenJsObject)
	if err != nil {
		return nil, fmt.Errorf("converting %v.%v to an object failed: %w",
			initJsFunctionName, instanceJsPropertyName, err)
	}

	exception = vm.Try(func() {
		value = clapgenJsObject.Get("_arguments")
	})
	if exception != nil {
		log.Println(exception.String())
		return nil, fmt.Errorf("getting %v.%v._arguments from JavaScript runtime failed: %w",
			initJsFunctionName, instanceJsPropertyName, exception)
	}
	if value == nil {
		return nil, fmt.Errorf("property not found: %v.%v._arguments",
			initJsFunctionName, instanceJsPropertyName, initJsFunctionName)
	}

	config := &Config{}
	err = vm.ExportTo(value, &config.Arguments)
	if err != nil {
		return nil, fmt.Errorf("converting %v.%v._arguments failed: %w",
			initJsFunctionName, instanceJsPropertyName, err)
	}

	return config, nil
}

type Config struct {
	Arguments []Argument `js:"_arguments"`
}

type Argument struct {
	Flag string `js:"flag"`
}

func jsConsoleLog(call goja.FunctionCall) goja.Value {
	printlnArgs := make([]any, 0, 0)
	for _, arg := range call.Arguments {
		printlnArgs = append(printlnArgs, arg.String())
	}
	log.Println(printlnArgs...)
	return goja.Null()
}

func registerConsole(vm *goja.Runtime) error {
	console := vm.NewObject()

	err := console.Set("log", jsConsoleLog)
	if err != nil {
		return err
	}

	return vm.GlobalObject().Set("console", console)
}
