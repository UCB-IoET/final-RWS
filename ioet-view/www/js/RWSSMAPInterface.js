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
        if(!containsObject(this.entries,entry)) {
			this.entries.push(entry);
        }
	}
    
    this.select_entry = function(entry) {
        if(!containsObject(available_nodes, entry)) {
        	//rework
            available_nodes.push(new RWSNode("SMAP", entry));
        }
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

function containsObject(list, obj) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}
