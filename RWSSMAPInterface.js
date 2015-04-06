//NOTE: THIS WON'T Work until we aren't running in the browser because of CORS issues
function RWSSMAPInterface(root_url) {
	this.nodes = []
	this.find_nodes = function() {
		function tree_walk_helper(url, response) {
			var data = JSON.parse(response)
			if(data['Contents'] && data['Contents'].length > 0) {
				data['Contents'].forEach(function(val) {
					var newUrl = url + '/' + val;
					$.getJSON(newUrl, function(resp) {
						tree_walk_helper(newUrl, resp)
					});
				});
			}
			//now check if this is a node
			if(data['Metadata'] && data['Metadata']['Type']) {
				if(data['Metadata']['Type'] == 'Reading') {
					var node = RWSSensor(data['uuid'], data['Properties']['ReadingType']);
					nodes.push(node);
				} else if(data['Metadata']['Type'] == 'Command') {
					var node = RWSActuator(data['uuid']);
					nodes.push(node);
				}
			}
		}

		$.getJSON(root_url, function(response) {
			tree_walk_helper(root_url, response)
		});
	}
}
