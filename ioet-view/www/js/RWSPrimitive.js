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
}

RWSPrimitive.prototype = new RWSNode();

RWSPrimitive.prototype.getExportRepresentation = function() {
		var obj = RWSNode.prototype.getExportRepresentation.call(this);

    	obj['type'] = 'call';
    	obj['name'] = this.name;
    	if(this.name == 'literal') {
    		obj['val'] = this.value;
    		obj['type'] = this.name;
    	}
    	return obj;
	}