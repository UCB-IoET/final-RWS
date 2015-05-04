var NEW_LINE = '<br/>';

function RWSSMAPNode(obj) {
    RWSNode.call(this, 'smap', obj);
    if(obj) {
      if(obj['Metadata']['Name']) {
        this.name = obj['Metadata']['Name'];
      } else if(obj['Metadata']['SourceName']) {
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
  	this.entries = {};
    //grab all the nodes
    $.ajax({
       type: 'POST',
       url: root_url,
       data: 'select distinct Metadata/SourceName;',
       success: function(data) {
          data.forEach(function(sourceName) {
            var verifyQuery =  'select data before now where Metadata/SourceName = "' + sourceName  + '"';
            var verified = [];
            $.ajax({
                   type: 'POST',
                   url: root_url,
                   data: verifyQuery,
                   success: function(readingData) {
                   	readingData.forEach(function(rDatum) {
	                   	if(rDatum['Readings'][0][0] > Date.now() - 10800000) { //last 3 hours
	                   		verified.push(rDatum.uuid);
	                   	}

                   	});
                   },
                   async:false
             });
            if(verified.length > 0) {
              verified.forEach(function(uuid) {
              	var metadataQuery = 'select * where uuid = "' + uuid + '"';
              	$.ajax({
	                type: 'POST',
	                url: root_url,
	                data: metadataQuery,
	                success: function(metadataData) {
  	               		var datum = metadataData[0];
   		                smap.add_entry(datum);
	                },
	                async:true
             	});
              })
            }
          });
       },
       error: function() {
          console.log("error loading nodes");
       },
       async:true
    });


  };

  this.add_entry = function(entry) {
  	if(entry['Metadata']['Name']) {
	  	this.entries[entry['Metadata']['Name']] = entry;
  	} else {
	  	this.entries[entry['Metadata']['SourceName']] = entry;
  	}
  	if(smap.popup) {
  		smap.popup.append("ul")
  		    .append("li")
  		    .attr('class', 'smapEntry')
  		    .on('click', function() { 
  		    	smapInterface.select_entry(entry);
  		    	document.getElementById('listNodeMask').style.display = "none";
  		    	valid = false;
  		    })
  		    .html(function() { return smapInterface.html_for_entry(entry); });
    }
  }
    
  this.select_entry = function(entry) {
      var node = new RWSSMAPNode(entry);
      available_nodes[node.id] = node;
  }

  this.html_for_entry = function(entry) {
  	str = '';
  	if(entry['Actuator'] && entry['Actuator']['Model']) {
  		str += 'Actuator' + NEW_LINE;

    if(entry['Metadata']['Name'])
    	str += 'Name: ' + entry['Metadata']['Name'] + NEW_LINE;
    else if(entry['Metadata']['SourceName'])
    	str += 'Name: ' + entry['Metadata']['SourceName'] + NEW_LINE;
  	} else {
      str += 'Reading' + NEW_LINE;
	  if(entry['Metadata']['Name'])
	    str += 'Name: ' + entry['Metadata']['Name'] + NEW_LINE;
	  else if(entry['Metadata']['SourceName'])
	    str += 'Name: ' + entry['Metadata']['SourceName'] + NEW_LINE;
      if(entry['Metadata']['Sensor'])
        str += 'Sensor: ' + entry['Metadata']['Sensor'] + NEW_LINE;
      if(entry['Properties'] && entry['Properties']['UnitofMeasure'])
        str += 'Units: ' + entry['Properties']['UnitofMeasure'] + NEW_LINE;
  	}
  	return str;
  }
}
