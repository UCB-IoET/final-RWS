//RWSNode.js
var nodeID = 0;
var wireID = 0;
var nodeColor = '#AAAAAA';

var nodeWidth = 120;
var nodeHeight = 60;
var cornerRadius = 20;

var ioSize = 15; // size of a triangle for input/output



//a port entry; Has a mode(input or output) and a wire attached to it
function RWSIOPort(mode, node, name, wire) { // 0 for input, 1 for output
	this.mode = mode;
	this.node = node || null;
	this.name = name || "";
	this.wire = wire || null;
	this.x = 0;
	this.y = 0;

	this.linkTo = function(port) {
		if(this != port && this.mode != port.mode) { //can only link inputs to outputs
			if(this.wire)
				this.wire.destroy();
			this.wire = new RWSWire(this, port);
			if(port.wire)
				port.wire.destroy();
			port.wire = this.wire;
		}
	}

	this.draw = function(context, selected) {
		context.beginPath();
		if(selected == this) {
			context.fillStyle = "rgba(150, 200, 50, .7)";
		} else {
			context.fillStyle = "rgba(50, 50, 50, .7)";
		}
		if(this.mode == 1) {
			context.moveTo(this.x, this.y);
			context.lineTo(this.x + ioSize , this.y + ioSize);
			context.lineTo(this.x + ioSize*2, this.y);
			context.fill(); //automatically closes path
			if(this.name)
				drawString(context, this.name, this.x, this.y - 4,"#333333", 0, 'serif', 12);
		} else {
			context.moveTo(this.x, this.y);
			context.lineTo(this.x + ioSize , this.y - ioSize);
			context.lineTo(this.x + ioSize*2, this.y);
			context.fill(); //automatically closes path
			if(this.name)
				drawString(context, this.name, this.x, this.y + ioSize,"#333333", 0, 'serif', 12);
		}
		if(this.wire) {
			this.wire.draw(context);
		}
	};

	this.contains = function(pos) {
		if(this.mode == 1) {
			return this.x < pos.x && this.x + ioSize*2 > pos.x && this.y < pos.y && this.y + ioSize > pos.y;
		} else {
			return this.x < pos.x && this.x + ioSize*2 > pos.x && this.y > pos.y && this.y - ioSize < pos.y;
		}
	}

	this.getConnectionPoint = function() {
		if(this.mode == 1) {
			return {'x': this.x + ioSize, 'y': this.y + ioSize};
		} else {
			return {'x': this.x + ioSize, 'y': this.y - ioSize};
		}
	}
}

//a wire, linking two ports together
function RWSWire(port1, port2) {
	//link between 2 nodes
	this.id = wireID++;
	if(port1.mode == 1) {
		this.source = port1;
		this.target = port2;
	} else {
		this.source = port2;
		this.target = port1;
	}
	application.wires.push(this);
	//each wire is drawn twice atm, maybe we can fix this later
	this.draw = function(context) {
		context.strokeStyle='black'
		context.beginPath();
		pt1 = this.source.getConnectionPoint();
		pt2 = this.target.getConnectionPoint();
		context.moveTo(pt1['x'], pt1['y']);
		context.lineTo(pt2['x'], pt2['y']);
		context.stroke();
		context.closePath();
	}

	//remove self from both source and target
	this.destroy = function() {
		this.source.wire = null;
		this.target.wire = null;
		application.wires.splice(application.wires.indexOf(this),1);
	}
}

//base class, container for node's actual data
function RWSNode(type, infoDict) {
	//metadata
	this.id = nodeID++;
	this.type = type;
	this.name = "";
	this.description = "";
	this.displayString = this.name + '\n' + this.description;
	this.inputs = [];
	this.outputs = [];
	this.infoDict = infoDict;

	//visual representation info
	this.x = Math.floor((Math.random() * 200) + 30);
	this.y = Math.floor((Math.random() * 200) + 30);
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
	context.strokeRect(this.x+(cornerRadius/2), this.y+(cornerRadius/2), nodeWidth-cornerRadius, nodeHeight-cornerRadius);
	context.fillRect(this.x+(cornerRadius/2), this.y+(cornerRadius/2), nodeWidth-cornerRadius, nodeHeight-cornerRadius);
	// context.fillRect(this.x, this.y, nodeWidth, nodeHeight);

	drawString(context, this.displayString, this.x + nodeWidth/2 - this.displayString.length * 5, this.y + nodeHeight/2, "#333333", 0, 'serif', 12);
  context.fillStyle="rgba(50, 50, 50, .7)";

  // set lineWidth back to original
  context.lineWidth = width;
    
    //draw triangles for inputs
    if(this.inputs.length > 0) {
    	for(var i = 0; i < this.inputs.length; i++) {
			this.inputs[i].draw(context, selected);
		    if(this.inputs[i].wire) {
		    	this.inputs[i].wire.draw(context);
		    }
		}
    }

    //draw triangles for outputs
    if(this.outputs.length > 0) {
    	for(var i = 0; i < this.outputs.length; i++) {
			this.outputs[i].draw(context, selected);
		    if(this.outputs[i].wire) {
		    	this.outputs[i].wire.draw(context);
		    }
		}
    }
}

RWSNode.prototype.rectContains = function(pos) {
	return this.x <= pos['x'] && pos['x'] <= this.x + nodeWidth && this.y <= pos['y'] && pos['y'] <= this.y + nodeHeight;
}

RWSNode.prototype.add_input = function(p) {
	var port = p || new RWSIOPort(0, this); 
	this.inputs.push(port);
	this.updatePorts();
}

RWSNode.prototype.add_output = function(p) {
	var port = p || new RWSIOPort(1, this); 
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
	var interval = (nodeWidth) / (this.inputs.length + 1);
	for(var i = 0; i < this.inputs.length; i++) {
		this.inputs[i].x = this.x + interval*(i+1) - ioSize;
		this.inputs[i].y = this.y;
	}
	interval = (nodeWidth) / (this.outputs.length + 1) ;
	for(var i = 0; i < this.outputs.length; i++) {
		this.outputs[i].x = this.x + interval*(i+1) - ioSize;
		this.outputs[i].y = this.y + nodeHeight;
	}
}

RWSNode.prototype.getExportRepresentation = function() {
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