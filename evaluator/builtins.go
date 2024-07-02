package evaluator

import "monkey/object"

var builtins = map[string]*object.Builtin{
	"len": {
		Fn: func(args ...object.Object) object.Object {
			if 1 > len(args) {
				return newError(
					"Too few arguments, expected %d, got %d",
					1,
					len(args),
				)
			}
			if 1 < len(args) {
				return newError(
					"Too many arguments, expected %d, got %d",
					1,
					len(args),
				)
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
			if 1 > len(args) {
				return newError(
					"Too few arguments, expected %d, got %d",
					1,
					len(args),
				)
			}
			if 1 < len(args) {
				return newError(
					"Too many arguments, expected %d, got %d",
					1,
					len(args),
				)
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
}
