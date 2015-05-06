var RESERVED_KEYS = ['inputs', 'outputs', 'infoDict']
function load_primitives(server_url) {
	var configs = {};
	$.ajax({
       type: 'GET',
       url: server_url+'/config',
       success: function(data) {
          configs = data;
       },
       error: function() {
       	  console.log("error retrieving primitives");
       },
       async:false
    });
    return configs;
}

function RWSPrimitive(category, primitiveName, obj) {
	RWSNode.call(this, primitiveName, {});
	for(var key in obj) {
		if(RESERVED_KEYS.indexOf(key) == -1)
			this[key] = obj[key]
	}
	this.category = category;
	this.name = primitiveName;

	if(obj['inputs'] && obj['inputs'].length > 0) {
		for(var input in obj['inputs']) {
			var val = obj['inputs'][input];
			if(typeof(val) == "object") { //loading from dict, there are already ports
				this.add_input(application.ports[val['id']])
			} else {
				this.add_input(new RWSIOPort(0, this.id, val));
			}
		}
	}

	if(obj['outputs'] && obj['outputs'].length > 0) {
		for(var output in obj['outputs']) {
			var val = obj['outputs'][output];
			if(typeof(val) == "object") { //loading from dict
				this.add_output(application.ports[val['id']])
			} else {
				this.add_output(new RWSIOPort(1, this.id, val));
			}
		}
	}
}

RWSPrimitive.prototype =Object.create(RWSNode.prototype);

RWSPrimitive.prototype.getExportRepresentation = function() {
	var obj = RWSNode.prototype.getExportRepresentation.call(this);
	obj["name"] = this.name;
	return obj;
}

RWSPrimitive.prototype.getDisplaySize = function() {
	return 14;
}

RWSPrimitive.prototype.populateInfoPopup = function(container) {
	container.html(this.name);
}