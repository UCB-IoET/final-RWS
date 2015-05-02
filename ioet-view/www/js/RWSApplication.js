var app_id = 1;

function RWSApplication(nodes, wires, ports) {
	this.nodes = nodes;
	this.wires = wires;
	this.ports = ports; //ports are how nodes connect to wires. 
	this.app_id = app_id++;

	this.getExportRepresentation = function() {
		var exportObject = {'type' : 'program', 'password' : 'password'};
		exportObject['pid'] = this.app_id;
		exportObject['uid'] = window.localStorage.getItem('uid');


	    var connections = {};
	    for(var wireID in this.wires) {
	    	connections[String(wireID)] = [String(this.ports[this.wires[wireID].targetID].nodeID)]; // or [String(wire.source.node.id), String(wire.target.node.id)]
	    }
	    exportObject['connections'] = connections;

	    var ports = {};
	    for(var portID in this.ports) {
	    	var port = this.ports[portID];
	    	ports[String(portID)] = String(port.nodeID), String(port.wireID); // or [String(wire.source.node.id), String(wire.target.node.id)]
	    }
	    exportObject['ports'] = ports;

	    var nodeDict = {};
	    var initialNodes = [];
	    for(var nodeID in this.nodes) {
	    	var node = this.nodes[nodeID];
	    	var obj = node.getExportRepresentation();
	    	nodeDict[String(nodeID)] = obj;	
	    	if(node.inputs.length == 0) {
	    		initialNodes.push(String(nodeID));
	    	}
	    };
	    exportObject['nodes'] = nodeDict;
	    exportObject['initial'] = initialNodes;

	    return exportObject;
	}
}


function loadApplicationWithID(app_id) {
	var programs = window.localStorage.getItem ("storedPrograms");
	if(programs != null) {
		programs = JSON.parse(programs)
		if(app_id in programs) {
			loadApplicationFromExport(programs[app_id]);
		}
	}
}

function loadApplicationFromExport(exportRepresentation) { //essentially the reverse of GetExportRepresntation
	application = new RWSApplication([], [], []);
	application.app_id = exportRepresentation['app_id'];

	//add ports first, this is important
	for(var portID in exportRepresentation['ports']) {
		var port = exportRepresentation['ports'][portID];
		port = new RWSIOPort(port.mode, port.nodeID, port.name, port.wireID, port.id);
	}


	for(var nodeID in exportRepresentation['nodes']) {
		var node = exportRepresentation['nodes'][nodeID]
		if(node.category == 'literal') {
			node = new RWSLiteral(node['name'],node)
		} else if(node.type == 'smap') {
			node = new RWSSMAPNode(node['infoDict'])
		} else {
			node = new RWSPrimitive(node['category'], node['name'], node);
		}
		application.nodes.push(node);
	}

	for(var wireID in exportRepresentation['wires']) {
		var wire = exportRepresentation['wires'][wireID]
		wire = new RWSWire(application.ports[wire.sourceID], application.ports[wire.targetID]);
	}
}