available_nodes = [];
console.log("hello");
var wires = [];
var selected = null;
var dragging = null;
var dragoffx = 0;
var dragoffy = 0;
var valid = false;

function clear(ctx) {
   	ctx.clearRect(0, 0, canvas.width, canvas.height);   
 }

function drawString(ctx, text, posX, posY, textColor, rotation, font, fontSize) {
	var lines = text.split("\n");
	if (!rotation) rotation = 0;
	if (!font) font = "'serif'";
	if (!fontSize) fontSize = 16;
	if (!textColor) textColor = '#000000';
	ctx.save();
	ctx.font = fontSize + "px " + font;
	ctx.fillStyle = textColor;
	ctx.translate(posX, posY);
	ctx.rotate(rotation * Math.PI / 180);
	for (i = 0; i < lines.length; i++) {
 		ctx.fillText(lines[i],0, i*fontSize);
	}
	ctx.restore();
}

function visualize() {
	if(canvas && !valid) {
		var ctx = canvas.getContext('2d');
		clear(ctx);
		available_nodes.forEach(function(node) {
			node.draw(ctx);
		});
		valid = true;
	}
}

function find_nearby_nodes() {
	//here we look for nearby nodes using smap
	var smap = new RWSSMAPInterface('http://shell.storm.pm:8079/api/query', available_nodes);
	smap.find_nodes();
    document.getElementById('listNodeMask').style.display = "block";
    d3.select("#listNodePopup").html();
    d3.select("#listNodePopup").append("ul").selectAll("li").data(smap.entries).enter()
        .append("li")
        .attr('class', 'smapEntry')
        .on('click', function(d, i) { 
        	smap.select_entry(d);
        	document.getElementById('listNodeMask').style.display = "none";
        	valid = false;
        })
        .html(function(d) { return smap.html_for_entry(d); });
}

function getMouse(e) {
	var canvas = $('canvas')[0];
	offsetX = 0;
	offsetY = 0;
    // Compute the total offset
    if (canvas.offsetParent !== undefined) {
      do {
        offsetX += canvas.offsetLeft;
        offsetY += canvas.offsetTop;
      } while ((canvas = canvas.offsetParent));
    }

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    return {'x': mx, 'y': my};
}

function onMouseDown(e) {
	var canvas = $('canvas')[0];
	if(canvas) {
		var mouse = getMouse(e);
		e.preventDefault();
	    dragging = null;
		available_nodes.forEach(function(node) {
			if(node.rectContains(mouse)) {
				dragging = node;
				dragoffset = mouse;
			}
		});
	}
}

function onMouseUp(e) {
	var canvas = $('canvas')[0];
	if(canvas) {
		var mouse = getMouse(e);
		var clickedPort = false;
		available_nodes.forEach(function(node) {
			var io = node.ioContains(mouse);
			if(!selected) {
				if(io != null) {
					clickedPort = true;
					selected = io;
					valid = false;
				}
			} else {
				if(io != null) {
					selected.linkTo(io);
					selected = null;
					valid = false;
				}
			}
		});
		if(!clickedPort) {
			selected = null;
		}
	}
}

function onMouseMove(e) {
	var canvas = $('canvas')[0];
	if(canvas && dragging) {
		e.preventDefault();
		var mouse = getMouse(e);
		var deltaX = mouse.x - dragoffset['x'];
		var deltaY = mouse.y - dragoffset['y'];
		dragging.x += deltaX;
		dragging.y += deltaY;
		dragging.updatePorts();
		dragoffset = mouse;
		valid = false;
	}
}

function show_add_popup() {
	document.getElementById('addNodeMask').style.display = "block";
	d3.select('#addPrimitivePopup').html('');
	d3.select('#addPrimitivePopup').append('ul').selectAll('li').data(PRIMITIVES).enter()
		.append('li').attr('class','smapEntry')
		.on('click', function(d, i) { 
			console.log(available_nodes);
			available_nodes.push(new RWSPrimitive(d));
        	document.getElementById('addNodeMask').style.display = "none";
        	valid = false;
        })
        .html(function(d) { return d; });
}

function send_model() {

program = {'type':'program',
           'password': 'password',
           'initial': ['0', '1'],
           'connections':{'0' : ['2'],
                          '1' : ['2'],
                          '2' : ['3']},
           'nwires' : 3,
           'nodes':{'0' : {'type': 'literal',
                           'val': 4,
                           'out': '0'},
                    '1' : {'type': 'literal',
                           'val': 8,
                           'out': '1'},
                    '2' : {'type': 'binop',
                           'op': '+',
                           'left': '0',
                           'right': '1',
                           'out': '2'},
                    '3' : {'type': 'call',
                           'name': 'print',
                           'in': ['2']}}}

/*
$.ajax({
	type: "POST",
	url: 
})

example1: 
$.ajax({
    type       : "POST",
    url        : "http://domain/public/login",
    crossDomain: true,
    beforeSend : function() {$.mobile.loading('show')},
    complete   : function() {$.mobile.loading('hide')},
    data       : {username : 'subin', password : 'passwordx'},
    dataType   : 'json',
    success    : function(response) {
        //console.error(JSON.stringify(response));
        alert('Works!');
    },
    error      : function() {
        //console.error("error");
        alert('Now working!');                  
    }
});  

example2: 
var http = new XMLHttpRequest();
var url = "get_data.php";
var params = "lorem=ipsum&name=binny";
http.open("POST", url, true);

//Send the proper header information along with the request
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
http.setRequestHeader("Content-length", params.length);
http.setRequestHeader("Connection", "close");

http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
        alert(http.responseText);
    }
}
http.send(params);

http://stackoverflow.com/questions/9713058/sending-post-data-with-a-xmlhttprequest


IP = "2607:f140:400:a001:189e:1858:2c10:b972"
IP = "2607:f140:400:a009:189e:1858:2c10:b972"
PORT=8888
BUFFER_SIZE = 1024
UDP_PORT = 1263

s = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

s.connect((IP, UDP_PORT))

resp = s.send(json.dumps(program))

print(resp)


*/

}



window.addEventListener("DOMContentLoaded", function() {
    canvas = $('canvas')[0];
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchmove', onMouseMove, false);
	setInterval(visualize, 50);
}, false);