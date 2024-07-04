# MonkeyLangInterpreter

![Monkey](https://img.shields.io/badge/MonkeyLang-Interpreter-blue)

Welcome to the Monkey Programming Language Interpreter, implemented in Go. This project is a hands-on exploration of language interpretation inspired by Thorsten Ball's [*Writing An Interpreter In Go*](https://interpreterbook.com/).

## 📜 Introduction

Monkey is a small, dynamically-typed programming language designed for educational purposes. It features familiar syntax and a variety of constructs including variables, functions, arrays, and more. This interpreter is a faithful implementation of the Monkey language as described in the book, offering a practical way to learn about interpreters and compilers.

## 🔧 Features

- **Lexer and Parser:** Tokenizes and parses Monkey code into an Abstract Syntax Tree (AST).
- **Evaluator:** Evaluates the AST to execute Monkey programs.
- **Interactive REPL:** Provides a Read-Eval-Print Loop for interactive coding and testing.

## 🌟 Language Highlights

- **Variable Bindings:**
    ```monkey
    let x = 10;
    let name = "Monkey";
    ```
- **Integers and Booleans and String:**
    ```monkey
    let flag = true;
    let number = 42;
    let string = "works";
    ```
- **Arithmetic Expressions:**
    ```monkey
    let sum = 2+3*4;
    ```
- **Functions:**
    ```monkey
    let add = fn(a,b) { a+b; };
    add(2,3); //5
    ```
- **Arrays and Hashes:**
    ```monkey
    let array = [1,2,3];
    let hash ={"key":"value"}
    ```
## 🚀 Getting Started

### Prerequisites
- Go: Any version should work

### Installation 
1. **Clone the repository:**
    ```sh
    git clone https://github.com/IslamEssam01/monkeyLangInterpreter.git
    ```
2. **Navigate to the project directory:**
    ```sh
    cd monkeyLangInterpreter
    ```
## Usage
Start the REPL to interact with the Monkey Language
    ```sh
    go run main.go
    ```

## 🗂️ Project Structure
- `lexer/`: Tokenizes Monkey code.
- `parser/`: Converts tokens into an AST.
- `ast/`: Defines the AST structures.
- `eval/`: Evaluates Monkey code.
- `repl/`: Handles the interactive REPL environment.
- `object/`: Contains object representations and the Monkey object system.
- `main.go`: Entry point of the interpreter.

## 📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

## 🎉 Acknowledgments
Thorsten Ball for his book [*Writing An Interpreter In Go*](https://interpreterbook.com/) which this project is based on.
