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
    
    this.select_entry = function(index) {
        if(!containsObject(available_nodes, smap.entries[index])) {
            console.log('pushing on node', smap.entries[index]);
            available_nodes.push(smap.entries[index]);
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
