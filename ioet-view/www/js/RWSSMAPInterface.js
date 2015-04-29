var NEW_LINE = '<br/>';

function RWSSMAPNode(obj) {
    RWSNode.call(this, 'smap', obj);
}

RWSSMAPNode.prototype = new RWSNode();

RWSSMAPNode.prototype.populateInfoPopup = function(container) {
  container.html(dict_to_html(this.infoDict));
}

RWSSMAPNode.prototype.getExportRepresentation = function() {
  var obj = {};
  obj['inputs'] = [];
  this.inputs.forEach(function(port) {
    if(port.wire)
        obj['inputs'].push(String(port.wire.id));
  });

  obj['outputs'] = [];
  this.outputs.forEach(function(port) {
    if(port.wire)
        obj['outputs'].push(String(port.wire.id));
  });

  obj['type'] = this.type;
  obj['smap-type'] = this['smap-type'];
  obj['uuid'] = this.infoDict['uuid'];
  obj['url'] = 'ws://shell.storm.pm:8078/republish';

  return obj;
}

//NOTE: THIS WON'T Work until we aren't running in the browser because of CORS issues
function RWSSMAPInterface(root_url, available_nodes) {
	var smap = this;
	smap.entries = [];
  this.find_nodes = function() {

    //grab all the nodes
    $.ajax({
       type: 'POST',
       url: root_url,
       data: 'select * where has Metadata/SourceName;',
       success: function(data) {
          data.forEach(function(datum) {
              smap.add_entry(datum);
          });
       },
       error: function() {
          console.log("error loading nodes");
       },
       async:false
    });


  };

  this.add_entry = function(entry) {
  	this.entries.push(entry);
  }
    
  this.select_entry = function(entry) {
      var node = new RWSSMAPNode(entry);
      if(entry['Metadata']['SourceName']) {
        node.name = entry['Metadata']['SourceName'];
      }
      node.uuid = entry['uuid'];
      if(entry['Actuator'] && entry['Actuator']['Model']) {
        node['smap-type'] = 'actuate';
        node.add_input(new RWSIOPort(0, node, entry['Actuator']['Model']));
      } else {
        node['smap-type'] = 'subscribe';
        node.add_output();
      }
      //need to check for duplicates
      available_nodes.push(node);
  }

  this.html_for_entry = function(entry) {
  	str = '';
  	if(entry['Actuator'] && entry['Actuator']['Model']) {
  		str += 'Actuator' + NEW_LINE;
      if(entry['Metadata']['SourceName'])
    		str += 'Name: ' + entry['Metadata']['SourceName'] + NEW_LINE;
  	} else {
      str += 'Input' + NEW_LINE;
      if(entry['Metadata']['SourceName'])
    		str += 'Name: ' + entry['Metadata']['SourceName'] + NEW_LINE;
      if(entry['Metadata']['Sensor'])
        str += 'Sensor: ' + entry['Metadata']['Sensor'] + NEW_LINE;
      if(entry['Properties'] && entry['Properties']['UnitofMeasure'])
        str += 'Units: ' + entry['Properties']['UnitofMeasure'] + NEW_LINE;
  	}
  	return str;
  }
}
