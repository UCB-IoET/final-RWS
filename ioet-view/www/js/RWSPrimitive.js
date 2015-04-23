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

function RWSPrimitive(category, primitiveName, obj) {
	RWSNode.call(this, primitiveName, {});
	this.name = primitiveName;
	this.type = category;

	if(obj['inputs'] && obj['inputs'].length > 0) {
		for(var input in obj['inputs']) {
			this.add_input(new RWSIOPort(0,this,obj['inputs'][input]));
		}
	}

	if(obj['outputs'] && obj['outputs'].length > 0) {
		for(var output in obj['outputs']) {
			this.add_output(new RWSIOPort(1,this,obj['outputs'][output]));
		}
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