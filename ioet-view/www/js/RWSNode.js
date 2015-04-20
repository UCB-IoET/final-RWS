//RWSNode.js
var nodeID = 0;

var TYPES = ["SMAP", "SVCD", "PRIMITIVE"];
var nodeColor = '#AAAAAA';

var nodeWidth = 80;
var nodeHeight = 40;

var ioSize = 10; // size of a triangle for input/output


//a port entry; Has a mode(input or output) and a wire attached to it
function RWSIOPort(mode, name, wire) { // 0 for input, 1 for output
	this.mode = mode;
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

	this.draw = function(context) {
		context.beginPath();
		if(this.mode == 1) {
			context.moveTo(this.x, this.y);
			context.lineTo(this.x + ioSize , this.y + ioSize);
			context.lineTo(this.x + ioSize*2, this.y);
			context.fill(); //automatically closes path
			if(this.name)
				drawString(context, this.name, this.x, this.y - 4,"#333333", 0, 'serif', 10);
		} else {
			context.moveTo(this.x, this.y);
			context.lineTo(this.x + ioSize , this.y - ioSize);
			context.lineTo(this.x + ioSize*2, this.y);
			context.fill(); //automatically closes path
			if(this.name)
				drawString(context, this.name, this.x, this.y,"#333333", 0, 'serif', 10);
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
	this.source = port1;
	this.target = port2;
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
	}
}

//base class, container for node's actual data
function RWSNode(type, infoDict) {
	//metadata
	this.id = nodeID++;
	this.name = "";
	this.description = "";
	this.inputs = [];
	this.outputs = [];
	this.infoDict = infoDict;

	//visual representation info
	this.x = Math.floor((Math.random() * 200) + 30);
	this.y = Math.floor((Math.random() * 200) + 30);

	this.draw = function(context) {
        context.fillStyle="rgba(150, 150, 150, 1)";
		context.fillRect(this.x, this.y, nodeWidth, nodeHeight);
		drawString(context, this.name + '\n' + this.description, this.x + 5, this.y + 10, "#333333", 0, 'serif', 12);
        context.fillStyle="rgba(50, 50, 50, .7)";
        
        //draw triangles for inputs
        if(this.inputs.length > 0) {
        	for(var i = 0; i < this.inputs.length; i++) {
				this.inputs[i].draw(context);
			    if(this.inputs[i].wire) {
			    	this.inputs[i].wire.draw(context);
			    }
			}
        }

        //draw triangles for outputs
        if(this.outputs.length > 0) {
        	for(var i = 0; i < this.outputs.length; i++) {
				this.outputs[i].draw(context);
			    if(this.outputs[i].wire) {
			    	this.outputs[i].wire.draw(context);
			    }
			}
        }
	}

	this.rectContains = function(pos) {
		return this.x <= pos['x'] && pos['x'] <= this.x + nodeWidth && this.y <= pos['y'] && pos['y'] <= this.y + nodeHeight;
	}

	this.add_input = function(p) {
		var port = p || new RWSIOPort(0); 
		this.inputs.push(port);
    	var interval = (nodeWidth - (ioSize*2)*this.inputs.length) / (this.inputs.length + 1);
    	for(var i = 0; i < this.inputs.length; i++) {
    		this.inputs[i].x = this.x + interval*(i+1);
    		this.inputs[i].y = this.y;
    	}
	}

	this.add_output = function(p) {
		var port = p || new RWSIOPort(1); 
		this.outputs.push(port);
    	var interval = (nodeWidth - (ioSize*2)*this.outputs.length) / (this.outputs.length + 1);
    	for(var i = 0; i < this.outputs.length; i++) {
    		this.outputs[i].x = this.x + interval*(i+1);
    		this.outputs[i].y = this.y + nodeHeight;
    	}
    }

	this.ioContains = function(pos) {
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

	this.updatePorts = function() {
    	var interval = (nodeWidth - (ioSize*2)*this.inputs.length) / (this.inputs.length + 1);
    	for(var i = 0; i < this.inputs.length; i++) {
    		this.inputs[i].x = this.x + interval*(i+1);
    		this.inputs[i].y = this.y;
    	}
    	interval = (nodeWidth - (ioSize*2)*this.outputs.length) / (this.outputs.length + 1);
    	for(var i = 0; i < this.outputs.length; i++) {
    		this.outputs[i].x = this.x + interval*(i+1);
    		this.outputs[i].y = this.y + nodeHeight;
    	}
	}
}