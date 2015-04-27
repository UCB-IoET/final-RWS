{
    "comparison": {
        "==": {
            "inputs": ["threshold", "value"],
            "op": "==",
            "type": "binop",
            "outputs": ["result"]
        },
        "if": {
            "inputs": ["value"],
            "type": "if",
            "outputs": ["true", "false"]
        },
        "!=": {
            "inputs": ["threshold", "value"],
            "op": "!=",
            "type": "binop",
            "outputs": ["result"]
        },
        "<": {
            "inputs": ["threshold", "value"],
            "op": "<",
            "type": "binop",
            "outputs": ["result"]
        },
        ">": {
            "inputs": ["threshold", "value"],
            "op": ">",
            "type": "binop",
            "outputs": ["result"]
        }
    },
    "literal": {
        "number": {
            "type": "literal",
            "value": true,
            "outputs": ["num"]
        },
        "string": {
            "type": "literal",
            "value": true,
            "outputs": ["str"]
        }
    },
    "call": {
        "print": {
            "inputs": ["inputs"],
            "type": "call",
            "name": "print"
        }
    },
    "math": {
        "+": {
            "inputs": ["threshold", "value"],
            "op": "+",
            "type": "binop",
            "outputs": ["result"]
        },
        "*": {
            "inputs": ["threshold", "value"],
            "op": "*",
            "type": "binop",
            "outputs": ["result"]
        },
        "-": {
            "inputs": ["threshold", "value"],
            "op": "-",
            "type": "binop",
            "outputs": ["result"]
        },
        "/": {
            "inputs": ["threshold", "value"],
            "op": "/",
            "type": "binop",
            "outputs": ["result"]
        }
    }
}
