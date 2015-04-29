var RESERVED_KEYS = ['name', 'inputs', 'outputs', 'infoDict']
function load_primitives(server_url) {
	var configs = {};
	$.ajax({
       type: 'GET',
       url: server_url+'/config',
       success: function(data) {
          configs = data;
       },
       async:false
    });
    return configs;
}

function RWSPrimitive(category, primitiveName, obj) {
	RWSNode.call(this, primitiveName, {});
	this.name = primitiveName;
	this.category = category;
	for(var key in obj) {
		if(RESERVED_KEYS.indexOf(key) == -1)
			this[key] = obj[key]
	}

	if(obj['inputs'] && obj['inputs'].length > 0) {
		for(var input in obj['inputs']) {
			this.add_input(new RWSIOPort(0,this,obj['inputs'][input]));
		}
	}

	if(obj['outputs'] && obj['outputs'].length > 0) {
		for(var output in obj['outputs']) {
			this.add_output(new RWSIOPort(1,this,obj['outputs'][output]));
		}
	}
}

RWSPrimitive.prototype = new RWSNode();

RWSPrimitive.prototype.getExportRepresentation = function() {
	var obj = RWSNode.prototype.getExportRepresentation.call(this);
	obj["name"] = this.name;
	return obj;
}

RWSPrimitive.prototype.populateInfoPopup = function(container) {
	container.html(this.name);
}