function RWSLiteral(type, obj) {
	RWSPrimitive.call(this, 'literal', type, obj);
	this.name = type;
	switch(type) {
		case 'number':
			this.value = 0;
		case 'string':
			this.value = 'hello';
	}
}

RWSLiteral.prototype = new RWSNode();

RWSLiteral.prototype.getExportRepresentation = function() {
	var obj = RWSNode.prototype.getExportRepresentation.call(this);
	obj['type'] = 'literal';
	obj['val'] = this.value;
	return obj;
}

RWSLiteral.prototype.populateInfoPopup = function(container) {
	var node = this;
	container.append('<form class="literalInput"><input type="text" name="value" id="formValue"><input type="submit" value="change"></form>');
	container.find('form').submit(function() {
		var value = $('#formValue').val();
		if(node.name == 'number') {
			node.value = value;
		} else {
			node.value = String(value);
		}
		console.log(node.value);
		return false;
	});
}