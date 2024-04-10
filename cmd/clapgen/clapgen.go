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

package main

import (
	_ "embed"
	"errors"
	"fmt"
	"github.com/dop251/goja"
	"log"
	"os"
	"text/template"
	"unicode/utf8"
)

const configJSFileName = "clapgen.js"

//go:embed preamble.js
var preambleJS string

const bashTemplateFileName = "bash.go.tmpl"

//go:embed bash.go.tmpl
var bashTemplate string

const preambleJSFileName = "preamble.js"

func main() {
	err := run()
	if err != nil {
		log.Fatal("ERROR: ", err)
	}
}

func run() error {
	config, err := loadConfig()
	if err != nil {
		return err
	}

	return generateCode(config)
}

func loadConfig() (*ClapgenConfig, error) {
	configJsBytes, err := os.ReadFile(configJSFileName)
	if err != nil {
		return nil, fmt.Errorf("reading config file failed: %v, (%w)", configJSFileName, err)
	}
	if !utf8.Valid(configJsBytes) {
		return nil, fmt.Errorf("invalid UTF-8 encoded text in config file: %v", configJSFileName)
	}
	configJS := string(configJsBytes)

	vm := goja.New()
	vm.SetFieldNameMapper(goja.TagFieldNameMapper("js", false))

	err = registerConsole(vm)
	if err != nil {
		return nil, fmt.Errorf("registering JavaScript 'console' object failed: %w", err)
	}

	err = runJs(preambleJSFileName, preambleJS, vm)
	if err != nil {
		return nil, err
	}

	err = runJs(configJSFileName, configJS, vm)
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

const clapgenInitJsFunctionName = "clapgen_init"
const clapgenInstanceJsPropertyName = "clapgenInstance"

func extractConfig(vm *goja.Runtime) (*ClapgenConfig, error) {
	var value goja.Value
	exception := vm.Try(func() {
		value = vm.Get(clapgenInitJsFunctionName)
	})
	if exception != nil {
		log.Println(exception.String())
		return nil, fmt.Errorf("getting '%v' from JavaScript runtime failed: %w",
			clapgenInitJsFunctionName, exception)
	}
	if value == nil {
		return nil, fmt.Errorf("'%v' not found in JavaScript runtime",
			clapgenInitJsFunctionName)
	}

	var initFunction *goja.Object
	err := vm.ExportTo(value, &initFunction)
	if err != nil {
		return nil, fmt.Errorf("converting '%v' to an object failed: %w",
			clapgenInitJsFunctionName, err)
	}

	exception = vm.Try(func() {
		value = initFunction.Get(clapgenInstanceJsPropertyName)
	})
	if exception != nil {
		log.Println(exception.String())
		return nil, fmt.Errorf("getting %v.%v from JavaScript runtime failed: %w",
			clapgenInitJsFunctionName, clapgenInstanceJsPropertyName, exception)
	}
	if value == nil {
		return nil, fmt.Errorf("property not found: %v.%v (ensure that %v() was called exactly once)",
			clapgenInitJsFunctionName, clapgenInstanceJsPropertyName, clapgenInitJsFunctionName)
	}

	var clapgenJsObject *goja.Object
	err = vm.ExportTo(value, &clapgenJsObject)
	if err != nil {
		return nil, fmt.Errorf("converting %v.%v to an object failed: %w",
			clapgenInitJsFunctionName, clapgenInstanceJsPropertyName, err)
	}

	exception = vm.Try(func() {
		value = clapgenJsObject.Get("_arguments")
	})
	if exception != nil {
		log.Println(exception.String())
		return nil, fmt.Errorf("getting %v.%v._arguments from JavaScript runtime failed: %w",
			clapgenInitJsFunctionName, clapgenInstanceJsPropertyName, exception)
	}
	if value == nil {
		return nil, fmt.Errorf("property not found: %v.%v._arguments",
			clapgenInitJsFunctionName, clapgenInstanceJsPropertyName, clapgenInitJsFunctionName)
	}

	config := &ClapgenConfig{}
	err = vm.ExportTo(value, &config.Arguments)
	if err != nil {
		return nil, fmt.Errorf("converting %v.%v._arguments failed: %w",
			clapgenInitJsFunctionName, clapgenInstanceJsPropertyName, err)
	}

	return config, nil
}

type ClapgenConfig struct {
	Arguments []ClapgenArgument `js:"_arguments"`
}

type ClapgenArgument struct {
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

func generateCode(config *ClapgenConfig) error {
	tmpl, err := template.New(bashTemplateFileName).Parse(bashTemplate)
	if err != nil {
		return fmt.Errorf("parsing template failed: %v (%w)", bashTemplateFileName, err)
	}

	err = tmpl.Execute(os.Stdout, config)
	if err != nil {
		return fmt.Errorf("executing template failed: %w", err)
	}

	return nil
}
