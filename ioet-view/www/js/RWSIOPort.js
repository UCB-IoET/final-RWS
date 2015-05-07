var ioSize = 15; // size of a triangle for input/output

var wireID = 1;
function next_wire_id() {
	while (wireID in application.wires) {
		++wireID;
	}
	return wireID;
}

//a port entry; Has a mode(input or output) and a wire attached to it
function RWSIOPort(mode, nodeID, name, wireID, id) { // 0 for input, 1 for output
	this.mode = mode;
	this.nodeID = nodeID || null;
	this.wireID = wireID || null;
	this.name = name || "";
	if(id) {
		this.id = id;
		portID = id+1;
	} else {
		this.id = application.ports.length;
	}
	this.x = 0;
	this.y = 0;
	application.ports.push(this)

	this.draw = function(context, selected, displayName) {
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
			if (displayName) {
				displayString = name;
			} else {
				displayString = "";
			}
			if(this.name)
				drawString(context, displayString, this.x, this.y - 4,"#333333", 0, 'serif', 12);
		} else {
			context.moveTo(this.x, this.y);
			context.lineTo(this.x + ioSize , this.y - ioSize);
			context.lineTo(this.x + ioSize*2, this.y);
			context.fill(); //automatically closes path
			if (displayName) {
				displayString = name;
			} else {
				displayString = "";
			}
			if(this.name)
				drawString(context, displayString, this.x, this.y + ioSize,"#333333", 0, 'serif', 12);
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
function RWSWire(port1, port2, id) {
	//link between 2 nodes
	this.id = id || next_wire_id();
	if(port1.mode == 1) {
		this.sourceID = port1.id;
		this.targetID = port2.id;
	} else {
		this.sourceID = port2.id;
		this.targetID = port1.id;
	}
	application.wires[this.id] = this;
	//each wire is drawn twice atm, maybe we can fix this later
	this.draw = function(context) {
		context.strokeStyle='black'
		context.beginPath();
		pt1 = application.ports[this.sourceID].getConnectionPoint();
		pt2 = application.ports[this.targetID].getConnectionPoint();
		context.moveTo(pt1['x'], pt1['y']);
		context.lineTo(pt2['x'], pt2['y']);
		context.stroke();
		context.closePath();
	}

	//remove self from both source and target
	this.destroy = function() {
		application.ports[this.sourceID].wireID = null;
		application.ports[this.targetID].wireID = null;
		delete application.wires[this.id];
	}
}

function linkPorts(port1, port2){
	if(port1 != port2 && port1.mode != port2.mode) { //can only link inputs to outputs
		var wire = new RWSWire(port1, port2);
		if(port1.wireID != null)
			application.wires[port1.wireID].destroy();
		port1.wireID = wire.id;
		if(port2.wireID != null)
			application.wires[port2.wireID].destroy();
		port2.wireID = wire.id;
	}
}