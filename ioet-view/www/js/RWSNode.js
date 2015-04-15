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
	this.x = Math.floor((Math.random() * 200) + 30);
	this.y = Math.floor((Math.random() * 200) + 30);
	this.inputs = [];
	this.outputs = [];
	this.infoDict = infoDict;

	//potentially move this if statement into the SMAP interface
	//so we don't have any SMAP parsing in here
	if(type === TYPES[0]) { //SMAP
		if ("Name" in this.infoDict) {
			this.name = this.infoDict["Name"];
		} else {
			this.name = this.infoDict["Path"];
		}
	} else if(type === TYPES[1]) { //SVCD

	}


	this.draw = function(context) {
        context.fillStyle="rgba(150, 150, 150, 1)";
		context.fillRect(this.x, this.y, nodeWidth, nodeHeight);
		context.fillStyle="#333333";
        context.fillText(this.name, this.x + nodeWidth/2 - context.measureText(this.name).width/2, this.y + 10);

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