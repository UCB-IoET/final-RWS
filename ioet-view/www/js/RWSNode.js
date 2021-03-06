//RWSNode.js
var nodeColor = '#AAAAAA';

var cornerRadius = 20;
var nodeID = 0;
var nodeHeight = 60;
function next_node_id() {
	while (nodeID in application.nodes) {
		++nodeID;
	}
	return nodeID;
}

//base class, container for node's actual data
function RWSNode(type, infoDict) {
	//metadata
	this.id = next_node_id();
	this.type = type;
	this.name = "";
	this.description = "";
	this.inputs = [];
	this.outputs = [];
	this.infoDict = infoDict;

	//visual representation info
	this.x = Math.floor((Math.random() * 200) + 30);
	this.y = Math.floor((Math.random() * 200) + 30);
}

RWSNode.prototype.getNodeWidth = function() {
	if(this.getDisplayString().length > 18) {
		return 180;
	}
	return 110;
}

RWSNode.prototype.getDisplayString = function() {
	return this.name + '\n' + this.description;
}

RWSNode.prototype.getDisplaySize = function() {
	return 14;
}

RWSNode.prototype.getDisplayX = function(x) {
	return x + this.getNodeWidth()/2;
}

RWSNode.prototype.getDisplayY = function(y) {
	return y + nodeHeight/2+4;
}

RWSNode.prototype.draw = function(context, selected) {
  context.fillStyle="rgba(150, 150, 150, 1)";
  context.strokeStyle="rgba(150, 150, 150, 1)";

  // save original lineWidth
  var width = context.lineWidth

  // Set faux rounded corners
  context.lineJoin = "round";
  context.lineWidth = cornerRadius;

  // Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
  context.strokeRect(this.x+(cornerRadius/2), this.y+(cornerRadius/2), this.getNodeWidth()-cornerRadius, nodeHeight-cornerRadius);
  context.fillRect(this.x+(cornerRadius/2), this.y+(cornerRadius/2), this.getNodeWidth()-cornerRadius, nodeHeight-cornerRadius);

  var displayString = this.getDisplayString();
  var displaySize = this.getDisplaySize();
  var X = this.getDisplayX(this.x);
  var Y = this.getDisplayY(this.y);
  drawString(context, displayString, X, Y, "#333333", 0, 'serif', displaySize);
  context.fillStyle="rgba(50, 50, 50, .7)";

  // set lineWidth back to original
  context.lineWidth = width;
  
    //draw triangles for inputs
  if(this.inputs.length > 0) {
    	for(var i = 0; i < this.inputs.length; i++) {
			this.inputs[i].draw(context, selected, this.inputs.length > 1);
		}
  }

    //draw triangles for outputs
  if(this.outputs.length > 0) {
    	for(var i = 0; i < this.outputs.length; i++) {
			this.outputs[i].draw(context, selected, this.outputs.length > 1);
		}
  }
}

RWSNode.prototype.rectContains = function(pos) {
	return this.x <= pos['x'] && pos['x'] <= this.x + this.getNodeWidth() && this.y <= pos['y'] && pos['y'] <= this.y + nodeHeight;
}

RWSNode.prototype.add_input = function(p) {
	var port = p || new RWSIOPort(0, this.id); 
	this.inputs.push(port);
	this.updatePorts();
}

RWSNode.prototype.add_output = function(p) {
	var port = p || new RWSIOPort(1, this.id); 
	this.outputs.push(port);
	this.updatePorts();
}

RWSNode.prototype.ioContains = function(pos) {
	for(var i = 0; i < this.inputs.length; i++) {
		if(this.inputs[i].contains(pos)) {
			return this.inputs[i];
		}
	}

	for(var i = 0; i < this.outputs.length; i++) {
		if(this.outputs[i].contains(pos)) {
			return this.outputs[i];
		}
	}
}

RWSNode.prototype.updatePorts = function() {
	var interval = (this.getNodeWidth()) / (this.inputs.length + 1);
	for(var i = 0; i < this.inputs.length; i++) {
		this.inputs[i].x = this.x + interval*(i+1) - ioSize;
		this.inputs[i].y = this.y;
	}
	interval = (this.getNodeWidth()) / (this.outputs.length + 1) ;
	for(var i = 0; i < this.outputs.length; i++) {
		this.outputs[i].x = this.x + interval*(i+1) - ioSize;
		this.outputs[i].y = this.y + nodeHeight;
	}
}

RWSNode.prototype.getExportRepresentation = function() {
	var obj = {};
	obj['inputs'] = [];
	this.inputs.forEach(function(port) {
		if(port.wireID)
    		obj['inputs'].push(String(port.wireID));
	});

	obj['outputs'] = [];
	this.outputs.forEach(function(port) {
		if(port.wireID)
    		obj['outputs'].push(String(port.wireID));
	});
	for(var key in this) {
		if(RESERVED_KEYS.indexOf(key) == -1)
			obj[key] = this[key];
	}

	return obj;
}

function dict_to_html(dict) {
	var html = '';
	for(var key in dict) {
		if(typeof dict[key] === 'string') {
			html += '<p>'+key+': ' + dict[key] + '</p>';
		} else {
			html += '<hr>';
			html += '<p><strong>'+key+': ' + '</strong></p>';
			html += dict_to_html(dict[key]); //ahh recursion
			html += '<hr>';
		}
	}
	return html
}

RWSNode.prototype.populateInfoPopup = function (container) {
	container.html(dict_to_html(this));
}

function createNodeFromExport(exp) {
	var node;
	if(exp.category == 'literal') {
		node = new RWSLiteral(exp['name'],exp);
	} else if(exp.type == 'smap') {
		node = SMAPNodeFromExport(exp);
	} else {
		node = new RWSPrimitive(exp['category'], exp['name'], exp);
	}

	for(var key in exp) {
		if(RESERVED_KEYS.indexOf(key) == -1)
			node[key] = exp[key];
	}
	return node
}