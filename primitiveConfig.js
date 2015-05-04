{
    "comparison": {
        "==": {
            "inputs": ["val1", "val2"],
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
            "inputs": ["val1", "val2"],
            "op": "!=",
            "type": "binop",
            "outputs": ["result"]
        },
        "<": {
            "inputs": ["val1", "val2"],
            "op": "<",
            "type": "binop",
            "outputs": ["result"]
        },
        ">": {
            "inputs": ["val1", "val2"],
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
            "inputs": ["input"],
            "type": "call",
            "name": "print"
        },
        "even?": {
            "inputs": ["input"],
            "type": "call",
            "name": "even?",
            "outputs": ["output"]
        }
    },
    "math": {
        "%": {
            "inputs": ["val1", "val2"],
            "op": "%",
            "type": "binop",
            "outputs": ["result"]
        },
        ">>": {
            "inputs": ["val1", "val2"],
            "op": ">>",
            "type": "binop",
            "outputs": ["result"]
        },
        "&": {
            "inputs": ["val1", "val2"],
            "op": "&",
            "type": "binop",
            "outputs": ["result"]
        },
        "<<": {
            "inputs": ["val1", "val2"],
            "op": "<<",
            "type": "binop",
            "outputs": ["result"]
        },
        "*": {
            "inputs": ["val1", "val2"],
            "op": "*",
            "type": "binop",
            "outputs": ["result"]
        },
        "-": {
            "inputs": ["val1", "val2"],
            "op": "-",
            "type": "binop",
            "outputs": ["result"]
        },
        "/": {
            "inputs": ["val1", "val2"],
            "op": "/",
            "type": "binop",
            "outputs": ["result"]
        },
        "|": {
            "inputs": ["val1", "val2"],
            "op": "|",
            "type": "binop",
            "outputs": ["result"]
        },
        "**": {
            "inputs": ["val1", "val2"],
            "op": "**",
            "type": "binop",
            "outputs": ["result"]
        },
        "+": {
            "inputs": ["val1", "val2"],
            "op": "+",
            "type": "binop",
            "outputs": ["result"]
        },
        "^": {
            "inputs": ["val1", "val2"],
            "op": "^",
            "type": "binop",
            "outputs": ["result"]
        }
    }
}

