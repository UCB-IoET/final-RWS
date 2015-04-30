var app_id = 1;

function RWSApplication(nodes, wires) {
	this.nodes = nodes;
	this.wires = wires;
	this.app_id = app_id++;

	this.getExportRepresentation = function() {
		var exportObject = {'type' : 'program', 'password' : 'password'};
		exportObject['uid'] = this.app_id;
	    var initialNodes = [];

	    this.nodes.forEach(function(node) {
	    	if(node.inputs.length == 0) {
	    		initialNodes.push(String(node.id));
	    	}
	    });

	    exportObject['initial'] = initialNodes;

	    var connections = {};

	    this.wires.forEach(function(wire) {
	    	connections[String(wire.id)] = [String(wire.target.node.id)]; // or [String(wire.source.node.id), String(wire.target.node.id)]
	    });
	    exportObject['connections'] = connections;


	    var nodeDict = {};

	    this.nodes.forEach(function(node) {
	    	var obj = node.getExportRepresentation();
	    	nodeDict[String(node.id)] = obj;
	    });
	    exportObject['nodes'] = nodeDict;

	    return exportObject;
	}
}