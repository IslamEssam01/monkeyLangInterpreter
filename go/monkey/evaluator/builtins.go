package evaluator

import (
	"bytes"
	"fmt"
	"monkey/object"
)

var builtins = map[string]*object.Builtin{
	"len": {
		Fn: func(args ...object.Object) object.Object {
			argsError := argumentsError(args, 1)
			if argsError != nil {
				return argsError
			}
			switch arg := args[0].(type) {
			case *object.String:
				return &object.Integer{Value: int64(len(arg.Value))}
			case *object.Array:
				return &object.Integer{Value: int64(len(arg.Elements))}
			default:
				return newError("argument to `len` not supported, got %s", args[0].Type())
			}
		},
	},
	"first": {
		Fn: func(args ...object.Object) object.Object {
			argsError := argumentsError(args, 1)
			if argsError != nil {
				return argsError
			}
			arr, ok := args[0].(*object.Array)
			if !ok {
				return newError("argument to `first` must be ARRAY, got %s", args[0].Type())
			}

			if len(arr.Elements) < 1 {
				return newError("Array have 0 elements , can't return `first`")
			}
			return arr.Elements[0]
		},
	},
	"last": {
		Fn: func(args ...object.Object) object.Object {
			argsError := argumentsError(args, 1)
			if argsError != nil {
				return argsError
			}
			arr, ok := args[0].(*object.Array)
			if !ok {
				return newError("argument to `last` must be ARRAY, got %s", args[0].Type())
			}

			if len(arr.Elements) < 1 {
				return newError("Array have 0 elements , can't return `last`")
			}
			return arr.Elements[len(arr.Elements)-1]
		},
	},
	"rest": {
		Fn: func(args ...object.Object) object.Object {
			argsError := argumentsError(args, 1)
			if argsError != nil {
				return argsError
			}
			arr, ok := args[0].(*object.Array)
			if !ok {
				return newError("argument to `rest` must be ARRAY, got %s", args[0].Type())
			}

			if len(arr.Elements) < 1 {
				return newError("Array have 0 elements , can't return `rest`")
			}

			newElements := make([]object.Object, len(arr.Elements)-1)
			copy(newElements, arr.Elements[1:])
			return &object.Array{Elements: newElements}
		},
	},
	"push": {
		Fn: func(args ...object.Object) object.Object {
			argsError := argumentsError(args, 2)
			if argsError != nil {
				return argsError
			}

			arr, ok := args[0].(*object.Array)
			if !ok {
				return newError("argument to `rest` must be ARRAY, got %s", args[0].Type())
			}

			newElements := make([]object.Object, len(arr.Elements)+1)

			copy(newElements, arr.Elements)
			newElements[len(arr.Elements)] = args[1]

			return &object.Array{Elements: newElements}
		},
	},
	"set": {
		Fn: func(args ...object.Object) object.Object {
			argsError := argumentsError(args, 3)
			if argsError != nil {
				return argsError
			}
			hash, ok := args[0].(*object.Hash)
			if !ok {
				return newError("argument to `set` must be HASH, got %s", args[0].Type())
			}

			key, ok := args[1].(object.Hashable)
			if !ok {
				return newError("unusable as hash key: %s", args[1].Type())
			}

			pair := object.HashPair{Key: args[1], Value: args[2]}
			hash.Pairs[key.HashKey()] = pair

			return NULL
		},
	},

	"puts": {
		Fn: func(args ...object.Object) object.Object {
			for _, arg := range args {
				fmt.Println(arg.Inspect())
			}
			return NULL
		},
	},
	"sputs": {
		Fn: func(args ...object.Object) object.Object {
			var out bytes.Buffer
			for i, arg := range args {
				out.WriteString(arg.Inspect())
				if i != len(args)-1 {
					out.WriteString("\n")
				}
			}
			return &object.String{Value: out.String()}
		},
	},
}

func argumentsError(args []object.Object, length int) *object.Error {
	if length > len(args) {
		return newError(
			"Too few arguments, expected %d, got %d",
			length,
			len(args),
		)
	}
	if length < len(args) {
		return newError(
			"Too many arguments, expected %d, got %d",
			length,
			len(args),
		)
	}

	return nil
}
