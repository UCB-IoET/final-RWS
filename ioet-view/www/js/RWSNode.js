//RWSNode.js
var nodeID = 0;

var TYPES = ["SMAP", "SVCD"];

//base class, container for node's actual data
function RWSNode(type, infoDict) {
	this.id = nodeID++;
	this.name = "";
	this.inputs = [];
	this.outputs = [];
	this.infoDict = infoDict;
	if(type === TYPES[0]) { //SMAP
		if ("Name" in this.infoDict) {
			this.name = this.infoDict["Name"];
		} else {
			this.name = this.infoDict["Path"];
		}
	} else if(type === TYPES[1]) { //SVCD

	}
}

//layer of abstraction for rendering this node onscreen, not stored
function VisualizationNode(node, x, y, r) {
	this.node = node;
	this.x = x || Math.floor((Math.random() * 200) + 30);
	this.y = y || Math.floor((Math.random() * 200) + 30);
	this.r = r || Math.floor((Math.random() * 20) + 20);
	this.selected = false;
}