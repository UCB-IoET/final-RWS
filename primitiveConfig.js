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
            "outputs": ["num"],
            "type": "literal",
            "value": true
        },
        "string": {
            "outputs": ["str"],
            "type": "literal",
            "value": true
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
