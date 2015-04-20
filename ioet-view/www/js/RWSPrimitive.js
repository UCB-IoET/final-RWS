var PRIMITIVES = 	['IF',
					'THRESHOLD',
					'ROUND',
					'BINARY',
					'literal',
					'print'];

function RWSPrimitive(primitiveName) {
	RWSNode.call(this, "PRIMITIVE", {});
	this.name = primitiveName;

	//add ports depending on the primitive
	switch(this.name) {
		case 'IF':
			this.add_input(new RWSIOPort(0, this, 'condition'));
			this.add_output(new RWSIOPort(1, this, 'done'));
			break;
		case 'THRESHOLD':
			this.add_input(new RWSIOPort(0, this, 'threshold'));
			this.add_input(new RWSIOPort(0, this, 'inputValue'));
			this.add_output(new RWSIOPort(1, this, 'greater'));
			break;

		case 'ROUND':
			this.add_input(new RWSIOPort(0, this, 'input'));
			this.add_output(new RWSIOPort(1, this, 'output'));
			break;

		case 'BINARY':
			this.add_input(new RWSIOPort(0, this, 'input'));
			this.add_output(new RWSIOPort(1, this, 'output'));
			break;

		case 'literal':
			this.value = 5;
			this.add_output(new RWSIOPort(1, this, 'output'));
			break;

		case 'print':
			this.add_input(new RWSIOPort(0, this, 'input'));
			break;

	}

	this.getExportRepresentation = function() {
		var obj = {};
    	obj['inputs'] = [];
    	this.inputs.forEach(function(port) {
    		if(port.wire)
	    		obj['inputs'].push(String(port.wire.id));
    	});

    	obj['outputs'] = [];
    	this.outputs.forEach(function(port) {
    		if(port.wire)
	    		obj['outputs'].push(String(port.wire.id));
    	});

    	obj['type'] = 'call';
    	obj['name'] = this.name;
    	if(this.name == 'literal') {
    		obj['val'] = this.value;
    		obj['type'] = this.name;
    	}
    	return obj;
	}
}

RWSPrimitive.prototype = new RWSNode;