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
	"fmt"
	"github.com/dop251/goja"
	"os"
)

//go:embed clapgen.js
var configJS string

const configJSFileName = "clapgen.js"

func main() {
	err := run()
	if err != nil {
		fmt.Println("ERROR:", err)
		os.Exit(1)
	}
}

func run() error {
	program, err := goja.Compile(configJSFileName, configJS, true)
	if err != nil {
		return fmt.Errorf("compiling JavaScript file failed: %v (%w)", configJSFileName, err)
	}

	vm := goja.New()

	err = registerConsole(vm)
	if err != nil {
		return fmt.Errorf("registering JavaScript 'console' object failed: %w", err)
	}

	result, err := vm.RunProgram(program)
	if err != nil {
		return fmt.Errorf("running JavaScript file failed: %v (%w)", configJSFileName, err)
	}

	fmt.Println(configJSFileName, "completed with result:", result.String())

	return nil
}

func consoleLog(call goja.FunctionCall) goja.Value {
	printlnArgs := make([]any, 0, 0)
	for _, arg := range call.Arguments {
		printlnArgs = append(printlnArgs, arg.Export())
	}
	fmt.Println(printlnArgs...)
	return goja.Null()
}

func registerConsole(vm *goja.Runtime) error {
	console := vm.NewObject()

	err := console.Set("log", consoleLog)
	if err != nil {
		return err
	}

	return vm.Set("console", console)
}
