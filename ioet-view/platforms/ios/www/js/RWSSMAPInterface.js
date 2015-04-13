//NOTE: THIS WON'T Work until we aren't running in the browser because of CORS issues
function RWSSMAPInterface(root_url, available_nodes) {
	var smap = this;
	smap.nodes = []
    this.find_nodes = function() {
        
        //first sensors
		$.post('http://new.openbms.org/backend/api/query','select * where Metadata/Type="Sensor"', function(data) {
           data.forEach(function(datum) {
                smap.add_node(new RWSSensor(datum["Path"], datum["Properties"]["ReadingType"]));
           });
               
         });
        
        //then actuators
        $.post('http://new.openbms.org/backend/api/query','select * where has Actuator', function(data) {
            data.forEach(function(datum) {
                console.log(datum);
                smap.add_node(new RWSActuator(datum["Path"], datum["Properties"]["ReadingType"]));
            });
        });
	};

	this.add_node = function(node) {
		if(!containsObject(this.nodes,node))
			this.nodes.push(node);
		if(!containsObject(available_nodes,node)) {
			console.log('pushing on node', node)
			available_nodes.push(node);
		}
	}
}

function containsObject(list, obj) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}
