function RWSLiteral(type, obj) {
	RWSPrimitive.call(this, 'literal', type, obj);
	this.name = type;
	switch(type) {
		case 'number':
			this.value = 0;
			break;
		case 'string':
			this.value = 'hello';
			break;
	}
}

RWSLiteral.prototype = Object.create(RWSPrimitive.prototype);

RWSLiteral.prototype.getDisplayString = function() {
	return this.value.toString();
}

RWSLiteral.prototype.getExportRepresentation = function() {
	var obj = RWSNode.prototype.getExportRepresentation.call(this);
	obj['type'] = 'literal';
	obj['val'] = this.value;
	return obj;
}

RWSLiteral.prototype.populateInfoPopup = function(container) {
	var node = this;
	if(node.name == 'number') {
		container.append('<form class="literalInput"><input type="number" step="0.01" name="value" id="formValue"><input type="submit" value="change"></form>');
		container.append('<p>'+this.value+'</p>')
	} else {
		container.append('<form class="literalInput"><input type="text" name="value" id="formValue"><input type="submit" value="change"></form>');
		container.append('<p>'+this.value+'</p>')
	}
	container.find('form').submit(function() {
		var value = $('#formValue').val();
		if(node.name == 'number') {
			node.value = Number(value);
		} else {
			node.value = String(value);
		}
		container.parent()[0].style.display="none";
		return false;
	});
}