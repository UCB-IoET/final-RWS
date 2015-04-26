{
    "comparison": {
        "==": {
            "inputs": ["threshold", "value"],
            "type": "==",
            "outputs": ["result"]
        },
        "if": {
            "inputs": ["value"],
            "type": "if",
            "outputs": ["true", "false"]
        },
        "!=": {
            "inputs": ["threshold", "value"],
            "type": "!=",
            "outputs": ["result"]
        },
        "<": {
            "inputs": ["threshold", "value"],
            "type": "<",
            "outputs": ["result"]
        },
        ">": {
            "inputs": ["threshold", "value"],
            "type": ">",
            "outputs": ["result"]
        }
    },
    "literal": {
        "number": {
            "inputs": ["outputVal"],
            "type": "literal",
            "value": true,
            "outputs": ["num"]
        },
        "string": {
            "inputs": ["outputVal"],
            "type": "literal",
            "value": true,
            "outputs": ["str"]
        }
    },
    "call": {
        "print": {
            "inputs": [{
                "inputs": "a value to print"
            }],
            "type": "call",
            "name": "print"
        }
    },
    "math": {
        "+": {
            "inputs": ["threshold", "value"],
            "type": "+",
            "outputs": ["result"]
        },
        "*": {
            "inputs": ["threshold", "value"],
            "type": "*",
            "outputs": ["result"]
        },
        "-": {
            "inputs": ["threshold", "value"],
            "type": "-",
            "outputs": ["result"]
        },
        "/": {
            "inputs": ["threshold", "value"],
            "type": "/",
            "outputs": ["result"]
        }
    }
}
