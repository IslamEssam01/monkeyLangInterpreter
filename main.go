package main

import (
	"fmt"
	"io"
	"log"
	"monkey/evaluator"
	"monkey/lexer"
	"monkey/object"
	"monkey/parser"
	"monkey/repl"
	"os"
)

func main() {
	// TODO: Refactor this code

	// Read command line arguments
	args := os.Args[1:] // os.Args[0] is the path to the program, so we skip it

	if len(args) > 1 {
		fmt.Print("Program only supports one argument , a file")
	}

	if len(args) == 1 {

		content, err := os.ReadFile(args[0])
		if err != nil {
			log.Fatal(err)
		}
		env := object.NewEnvironment()

		l := lexer.New(string(content))
		p := parser.New(l)
		program := p.ParseProgram()
		if len(p.Errors()) != 0 {
			printParserErrors(os.Stdout, p.Errors())
		}

		evaluated := evaluator.Eval(program, env)

		if evaluated != nil {
			io.WriteString(os.Stdout, evaluated.Inspect())
			io.WriteString(os.Stdout, "\n")
		}
		return
	}

	repl.Start(os.Stdin, os.Stdout)
}

func printParserErrors(out io.Writer, errors []string) {
	// io.WriteString(out, MONKEY_FACE)
	io.WriteString(out, "Woops! We ran into some monkey business here!\n")
	io.WriteString(out, " parser errors:\n")
	for _, msg := range errors {
		io.WriteString(out, "\t"+msg+"\n")
	}
}
