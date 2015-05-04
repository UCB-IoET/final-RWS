var NEW_LINE = '<br/>';

function RWSSMAPNode(obj) {
    RWSNode.call(this, 'smap', obj);
    if(obj) {
      if(obj['Metadata']['SourceName']) {
        this.name = obj['Metadata']['SourceName'];
      }
      this.uuid = obj['uuid'];
      if(obj['Actuator'] && obj['Actuator']['Model']) {
        this['smap-type'] = 'actuate';
        this.add_input(new RWSIOPort(0, this.id, obj['Actuator']['Model']));
      } else {
        this['smap-type'] = 'subscribe';
        this.add_output();
      }
    }
}

RWSSMAPNode.prototype = Object.create(RWSNode.prototype);

RWSSMAPNode.prototype.populateInfoPopup = function(container) {
  container.html(dict_to_html(this.infoDict));
}

RWSSMAPNode.prototype.getExportRepresentation = function() {
  var obj = {};
  obj['inputs'] = [];
  this.inputs.forEach(function(port) {
    if(port.wireID != null)
        obj['inputs'].push(String(port.wireID));
  });

  obj['outputs'] = [];
  this.outputs.forEach(function(port) {

    if(port.wireID != null)
        obj['outputs'].push(String(port.wireID));
  });

  obj['type'] = this.type;
  obj['smap-type'] = this['smap-type'];
  obj['uuid'] = this.infoDict['uuid'];
  obj['url'] = 'ws://shell.storm.pm:8078/republish';

  return obj;
}

function SMAPNodeFromExport(obj) {
  var smp = new RWSSMAPNode();
  smp['infoDict'] = obj['infoDict']
  obj.inputs.forEach(function(input) {
    smp.inputs.push(application.ports[input.id]);
  });
  obj.outputs.forEach(function(output) {
    smp.outputs.push(application.ports[output.id]);
  });
  return smp;
}

//NOTE: THIS WON'T Work until we aren't running in the browser because of CORS issues
function RWSSMAPInterface(root_url, available_nodes) {
	var smap = this;
	smap.entries = {};
  this.find_nodes = function() {

    //grab all the nodes
    $.ajax({
       type: 'POST',
       url: root_url,
       data: 'select * where has Metadata/SourceName;',
       success: function(data) {
          data.forEach(function(datum) {
            var verifyQuery =  'select data in (now -600minutes, now) limit 1 streamlimit 1 where Metadata/SourceName = "' + datum['Metadata']['SourceName']  + '"'
            var verified = true;
            // $.ajax({
            //        type: 'POST',
            //        url: root_url,
            //        data: verifyQuery,
            //        success: function(readingData) {
            //         if(readingData[0]['Readings'] && readingData[0]['Readings'].length > 0) {
            //           verified = true;
            //         }
            //        },
            //        async:false
            //  });
            if(verified) {
              smap.add_entry(datum);
            }
          });
       },
       error: function() {
          console.log("error loading nodes");
       },
       async:false
    });


  };

  this.add_entry = function(entry) {
  	this.entries[entry['Metadata']['SourceName']] = entry;
  }
    
  this.select_entry = function(entry) {
      var node = new RWSSMAPNode(entry);
      available_nodes[node.id] = node;
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
