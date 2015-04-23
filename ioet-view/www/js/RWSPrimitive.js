function load_primitives() {
	return { //very temporary obviously
		"literals" : { 
			"number" : { 
				"value" : 0,
				"outputs" : ["outputVal"]
			},
			"string" : {
				"value": "value",
				"outputs" : ["outputVal"]
			}
		},

		"call" : {
			"print" : {
				"inputs" : ["value"]
			}
		},

		"conditional" : {
			">=" : {
				"inputs" : ["threshold", "value"],
				"outputs" : ["result"]
			}, 
			"<=" : {
				"inputs" : ["threshold", "value"],
				"outputs" : ["result"]
			}, 
			"if" : {
				"inputs" : ["value"],
				"outputs" : ["true", "false"]
			}
		},

		"math" : {
			"round" : {
				"inputs" : ["value"],
				"outputs" : ["result"]
			},
			"binary" : {
				"inputs" : ["value"],
				"outputs" : ["result"]
			}
		}
	};
}

function RWSPrimitive(category, primitiveName) {
	RWSNode.call(this, primitiveName, {});
	this.name = primitiveName;
	this.type = category;

	//add ports depending on the primitive
	switch(this.name) {
		case "IF":
			this.add_input(new RWSIOPort(0, this, "condition"));
			this.add_output(new RWSIOPort(1, this, "done"));
			break;
		case "THRESHOLD":
			this.add_input(new RWSIOPort(0, this, "threshold"));
			this.add_input(new RWSIOPort(0, this, "inputValue"));
			this.add_output(new RWSIOPort(1, this, "greater"));
			break;

		case "ROUND":
			this.add_input(new RWSIOPort(0, this, "input"));
			this.add_output(new RWSIOPort(1, this, "output"));
			break;

		case "BINARY":
			this.add_input(new RWSIOPort(0, this, "input"));
			this.add_output(new RWSIOPort(1, this, "output"));
			break;

		case "print":
			this.add_input(new RWSIOPort(0, this, "input"));
			break;

	}
}

RWSPrimitive.prototype = new RWSNode();

RWSPrimitive.prototype.getExportRepresentation = function() {
	var obj = RWSNode.prototype.getExportRepresentation.call(this);

	obj["type"] = "call";
	obj["name"] = this.name;
	return obj;
}

RWSPrimitive.prototype.populateInfoPopup = function(container) {
	container.html(this.name);
}