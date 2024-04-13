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

package tscompiler

import (
	"embed"
	"errors"
	"fmt"
	"github.com/dop251/goja"
	"log"
)

//go:embed tscompiler.js
var tscompilerJS string

const tscompilerJSFileName = "tscompiler.js"

//go:embed staticfiles
var staticFilesFS embed.FS

type Compiler struct {
}

func (c *Compiler) Compile(fileName string, code string) (string, error) {
	var err error

	vm := goja.New()

	err = vm.GlobalObject().Set("_clapgenLoadStaticFile", jsLoadStaticFile)
	if err != nil {
		return "", fmt.Errorf("registering JavaScript '_clapgenLoadStaticFile' function failed: %w", err)
	}

	err = runJs(tscompilerJSFileName, tscompilerJS, vm)
	if err != nil {
		return "", err
	}

	return "", nil
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

func jsLoadStaticFile(fileName string, vm *goja.Runtime) goja.Value {
	fileBytes, err := staticFilesFS.ReadFile("staticfiles/" + fileName)
	if err != nil {
		return goja.Null()
	}

	fileText := string(fileBytes)

	return vm.ToValue(fileText)
}
