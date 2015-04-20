function export_application(nodes, wires) {
    var exportObject = {'type' : 'program', 'password' : 'password'};

    var initialNodes = [];

    nodes.forEach(function(node) {
    	if(node.inputs.length == 0) {
    		initialNodes.push(String(node.id));
    	}
    });

    exportObject['initial'] = initialNodes;

    var connections = {};

    wires.forEach(function(wire) {
    	connections[String(wire.id)] = String(wire.target.node.id); // or [String(wire.source.node.id), String(wire.target.node.id)]
    });
    exportObject['connections'] = connections;


    var nodeDict = {};

    nodes.forEach(function(node) {
    	var obj = node.getExportRepresentation();
    	nodeDict[String(node.id)] = obj;
    });
    exportObject['nodes'] = nodeDict;

    console.log(JSON.stringify(exportObject))

}