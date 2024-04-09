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
	"fmt"
	"github.com/dop251/goja"
	"os"
)

func main() {
	err := run()
	if err != nil {
		fmt.Println("ERROR:", err)
		os.Exit(1)
	}
}

func run() error {
	source, err := os.ReadFile("hello.js")
	if err != nil {
		return fmt.Errorf("reading file failed: hello.js (%w)", err)
	}

	program, err := goja.Compile("hello.js", string(source), true)
	if err != nil {
		return fmt.Errorf("compiling JavaScript file failed: hello.js (%w)", err)
	}

	vm := goja.New()

	err = registerConsole(vm)
	if err != nil {
		return fmt.Errorf("registering console failed: %w", err)
	}

	result, err := vm.RunProgram(program)
	if err != nil {
		return fmt.Errorf("running JavaScript file failed: hello.js (%w)", err)
	}

	fmt.Println("hello.js completed with result:", result.ToObject(vm))

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
