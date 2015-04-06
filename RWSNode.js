//RWSNode.js
var nodeID = 0;

//base class, container for node's actual data
function RWSNode(name) {
	this.id = nodeID++;
	this.name = name || "";
}

function RWSSensor(name, readingType) {
	RWSNode.call(this, name);
	this.readingType = readingType;
}
RWSSensor.prototype = new RWSNode;


function RWSActuator(name) {
	RWSNode.call(this, name);
}
RWSActuator.prototype = new RWSNode;


//layer of abstraction for rendering this node onscreen, not stored
function VisualizationNode(node, x, y, r) {
	this.node = node;
	this.x = x || Math.floor((Math.random() * 200) + 30);
	this.y = y || Math.floor((Math.random() * 200) + 30);
	this.r = r || Math.floor((Math.random() * 20) + 20);
	this.selected = false;
}