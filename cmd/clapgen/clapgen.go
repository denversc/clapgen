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
	"github.com/denversc/clapgen/internal/config"
	"log"
	"os"
	"text/template"
)

const bashTemplateFileName = "bash.go.tmpl"

//go:embed bash.go.tmpl
var bashTemplate string

func main() {
	err := run()
	if err != nil {
		log.Fatal("ERROR: ", err)
	}
}

func run() error {
	loadedConfig, err := config.Load("clapgen.js")
	if err != nil {
		return err
	}

	return generateCode(loadedConfig)
}

func generateCode(config *config.Config) error {
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
