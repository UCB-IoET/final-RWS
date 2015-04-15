//RWSNode.js
var nodeID = 0;

var TYPES = ["SMAP", "SVCD"];
var nodeColor = '#AAAAAA';

var nodeWidth = 80;
var nodeHeight = 40;

var ioSize = 10;

//base class, container for node's actual data
function RWSNode(type, infoDict) {
	this.id = nodeID++;
	this.name = "";
	this.description = "";
	this.x = Math.floor((Math.random() * 200) + 30);
	this.y = Math.floor((Math.random() * 200) + 30);
	this.inputs = [];
	this.outputs = [];
	this.infoDict = infoDict;

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
			    context.moveTo(this.x + interval, this.y);
			    context.lineTo(this.x + interval + ioSize , this.y - ioSize);
			    context.lineTo(this.x + interval + ioSize*2, this.y);
			    context.fill(); //automatically closes path
			}
        }

        //draw triangles for outputs
        if(this.outputs.length > 0) {
        	var interval = (nodeWidth - (ioSize*2)*this.outputs.length) / (this.outputs.length + 1);
        	for(var i = 0; i < this.outputs.length; i++) {
				context.beginPath();
			    context.moveTo(this.x + interval, this.y+ nodeHeight);
			    context.lineTo(this.x + interval + ioSize , this.y + nodeHeight + ioSize);
			    context.lineTo(this.x + interval + ioSize*2, this.y + nodeHeight);
			    context.fill(); //automatically closes path
			}
        }
        
	}
}