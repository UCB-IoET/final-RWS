//RWSNode.js
var nodeID = 0;

var TYPES = ["SMAP", "SVCD"];
var nodeColor = '#AAAAAA';

var nodeWidth = 80;
var nodeHeight = 40;

var ioSize = 10; // size of a triangle for input/output

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
        	var interval = (nodeWidth - (ioSize*2)*this.inputs.length) / (this.inputs.length + 1);
        	for(var i = 0; i < this.inputs.length; i++) {
				context.beginPath();
			    context.moveTo(this.x + interval*(i+1), this.y);
			    context.lineTo(this.x + interval*(i+1) + ioSize , this.y - ioSize);
			    context.lineTo(this.x + interval*(i+1) + ioSize*2, this.y);
			    context.fill(); //automatically closes path
			}
        }

        //draw triangles for outputs
        if(this.outputs.length > 0) {
        	var interval = (nodeWidth - (ioSize*2)*this.outputs.length) / (this.outputs.length + 1);
        	for(var i = 0; i < this.outputs.length; i++) {
				context.beginPath();
			    context.moveTo(this.x + interval*(i+1), this.y + nodeHeight);
			    context.lineTo(this.x + interval*(i+1) + ioSize, this.y + nodeHeight + ioSize);
			    context.lineTo(this.x + interval*(i+1) + ioSize*2, this.y + nodeHeight);
			    context.fill(); //automatically closes path
			}
        }
	}

	this.rectContains = function(pos) {
		return this.x <= pos['x'] && pos['x'] <= this.x + nodeWidth && this.y <= pos['y'] && pos['y'] <= this.y + nodeHeight;
	}

	this.ioContains = function(pos) {
    	var interval = (nodeWidth - (ioSize*2)*this.inputs.length) / (this.inputs.length + 1);
    	for(var i = 0; i < this.inputs.length; i++) {
    		if(this.x + interval*(i+1) < pos['x'] && this.x + interval*(i+1)  + ioSize*2 > pos['x'] && this.y > pos['y'] && this.y - ioSize < pos['y']) {
    			return this.inputs[i];
    		}
    	}
    	interval = (nodeWidth - (ioSize*2)*this.outputs.length) / (this.outputs.length + 1);
    	for(var i = 0; i < this.outputs.length; i++) {
    		if(this.x + interval*(i+1) < pos['x'] && this.x + interval*(i+1)  + ioSize*2 > pos['x'] && this.y + nodeHeight < pos['y'] && this.y + nodeHeight + ioSize > pos['y']) {
    			return this.outputs[i];
    		}
    	}
	}
}