//RWSNode.js
var nodeID = 0;

//base class, container for node's actual data
function RWSNode(name) {
	this.id = nodeID++;
	this.name = name || "";
}

function Sensor(name) {
	RWSNode.call(this, name);
}
Sensor.prototype = new RWSNode;

//layer of abstraction for rendering this node onscreen, not stored
function VisualizationNode(node, x, y, r) {
	this.node = node;
	this.x = x || Math.floor((Math.random() * 200) + 30);
	this.y = y || Math.floor((Math.random() * 200) + 30);
	this.r = r || Math.floor((Math.random() * 20) + 20);
}