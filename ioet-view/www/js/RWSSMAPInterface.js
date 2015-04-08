//NOTE: THIS WON'T Work until we aren't running in the browser because of CORS issues
function RWSSMAPInterface(root_url, available_nodes) {
	var smap = this;
	smap.nodes = []
	this.find_nodes = function() {
		function tree_walk_helper(url, response) {
			var data = response;
			if(data['Contents'] && data['Contents'].length > 0) {
				data['Contents'].forEach(function(val) {
					var newUrl = url + '/' + val;
					$.get(newUrl, function(resp) {
						tree_walk_helper(newUrl, resp)
					});
				});
			}
			//now check if this is a node
			if(data['Metadata'] && data['Metadata']['Type']) {
				if(data['Metadata']['Type'] == 'Reading') {
					var node = new RWSSensor(data['uuid'], data['Properties']['ReadingType']);
					smap.add_node(node);
				} else if(data['Metadata']['Type'] == 'Command') {
					var node = new RWSActuator(data['uuid']);
					smap.add_node(node);
				}
			}
		}

		$.get(root_url, function(response) {
			tree_walk_helper(root_url, response)
		});
	}

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
