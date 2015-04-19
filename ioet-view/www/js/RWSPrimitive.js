var PRIMITIVES = 	['IF',
					'THRESHOLD',
					'ROUND',
					'BINARY'];

function RWSPrimitive(primitiveName) {
	RWSNode.call(this, "PRIMITIVE", {});
	this.name = primitiveName;

	//add ports depending on the primitive
	switch(this.name) {
		case 'IF':
			this.add_input(new RWSIOPort(0, 'condition'));
			this.add_output(new RWSIOPort(1, 'done'));
			break;
		case 'THRESHOLD':
			this.add_input(new RWSIOPort(0, 'threshold'));
			this.add_input(new RWSIOPort(0, 'inputValue'));
			this.add_output(new RWSIOPort(1, 'greater'));
			break;

		case 'ROUND':
			this.add_input(new RWSIOPort(0, 'input'));
			this.add_output(new RWSIOPort(1, 'output'));
			break;

		case 'BINARY':
			this.add_input(new RWSIOPort(0, 'input'));
			this.add_output(new RWSIOPort(1, 'output'));
			break;

	}
}

RWSPrimitive.prototype = new RWSNode;