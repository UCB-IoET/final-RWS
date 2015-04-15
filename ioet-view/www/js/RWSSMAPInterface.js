var NEW_LINE = '<br/>';
//NOTE: THIS WON'T Work until we aren't running in the browser because of CORS issues
function RWSSMAPInterface(root_url, available_nodes) {
	var smap = this;
	smap.entries = []
  this.find_nodes = function() {
    //first sensors
    $.ajax({
        type: 'POST',
        url: root_url,
        data: 'select * where Metadata/Type="Sensor"',
        success: function(data) {
            data.forEach(function(datum) {
            smap.add_entry(datum);
            });
        }
        ,
       async:false
    });

    //then actuators
    $.ajax({
       type: 'POST',
       url: root_url,
       data: 'select * where has Actuator',
       success: function(data) {
           data.forEach(function(datum) {
            smap.add_entry(datum);
            });
       }
       ,
       async:false
    });
  };

  this.add_entry = function(entry) {
        //need to check for duplicates
  	this.entries.push(entry);
  }
    
  this.select_entry = function(entry) {
      var node = new RWSNode("SMAP", entry);
      if(entry['Metadata']['Name']) {
        node.name = entry['Metadata']['Name'];
      }
      node.uuid = entry['uuid'];
      if(entry['Actuator']) {
        node.inputs.push('actuation');
        if(entry['Metadata']['Type'] == 'Reading') {
          node.outputs.push('reading');
        }
      } else if(entry['Metadata']['Type'] == 'Sensor') {
        node.outputs.push('sensor');
        node.description = 'Sensor: ' + entry['Metadata']['Sensor'] + '\n'
        node.description += 'Units: ' + entry['Properties']['UnitofMeasure'];
      }
      //need to check for duplicates
      available_nodes.push(node);
  }

  this.html_for_entry = function(entry) {
  	str = '';
  	if(entry['Actuator']) {
  		str += 'Actuator' + NEW_LINE;
  		str += 'Path: ' + entry['Path'] + NEW_LINE;
  	} else if(entry['Metadata']['Type'] == 'Sensor') {
  		str += 'Sensor: ' + entry['Metadata']['Sensor'] + NEW_LINE;
  		str += 'Units: ' + entry['Properties']['UnitofMeasure'] + NEW_LINE;
  		str += 'Path: ' + entry['Path'] + NEW_LINE;
  	}
  	return str;
  }
}
