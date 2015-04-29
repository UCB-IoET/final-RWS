global_nodes = [];
global_wires = [];
// add url to your server here - format should be: http://10.142.34.191:1444 
server_url = "http://127.0.0.1:1456"

var selected = null;
var dragging = null;
var dragoffx = 0;
var dragoffy = 0;
var popupTimer = null
var dragDist = 0;
var valid = false;
var scaling = 1;
var panX = 0;
var panY =  0;

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
	    ctx.save();
		ctx.translate(panX, panY);
		ctx.scale(scaling, scaling);
		global_nodes.forEach(function(node) {
			node.draw(ctx, selected);
		});
		ctx.restore();
		valid = true;
	}
}

function find_nearby_nodes() {
	//here we look for nearby nodes using smap
	var smap = new RWSSMAPInterface('http://shell.storm.pm:8079/api/query', global_nodes);
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

    var mx = (e.pageX - offsetX - panX)  / scaling;
    var my = (e.pageY - offsetY - panY)  / scaling;

    return {'x': mx, 'y': my};
}

function onMouseDown(e) {
	var canvas = $('canvas')[0];
	if(canvas) {
		var mouse = getMouse(e);
		e.preventDefault();
	    dragging = null;
	    dragDist = 0;
	    if(e.touches.length == 1) {
			global_nodes.forEach(function(node) {
				if(node.rectContains(mouse)) {
					dragging = node;
					dragoffset = mouse;
					popupTimer = setTimeout(nodeInfoPopup, 1200, node); //open up the node info popup
				}
			});
	    } else if(e.touches.length == 2) {
			dragging = 'canvas';
			dragoffset = mouse;
	    }
	}
}

function onMouseUp(e) {
	if(popupTimer) {
		clearTimeout(popupTimer);
		popupTimer = null
	}

	var canvas = $('canvas')[0];
	if(canvas) {
		var mouse = getMouse(e);
		var clickedPort = false;

		global_nodes.forEach(function(node) {
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
	if(canvas && dragging && dragging != 'canvas') {
		e.preventDefault();
		var mouse = getMouse(e);
		var deltaX = mouse.x - dragoffset['x'];
		var deltaY = mouse.y - dragoffset['y'];
		dragging.x += deltaX;
		dragging.y += deltaY;
		dragging.updatePorts();
		dragoffset = mouse;
		dragDist += Math.sqrt(Math.pow(deltaX ,2) + Math.pow(deltaY,2));
		if(dragDist > 30 && popupTimer) {
			clearTimeout(popupTimer);
			popupTimer = null;
		}
		valid = false;
	} else if(dragging == 'canvas') {
		e.preventDefault();
		var mouse = getMouse(e);
		var deltaX = mouse.x - dragoffset['x'];
		var deltaY = mouse.y - dragoffset['y'];
		panX += deltaX * 2;
		panY += deltaY * 2;
		dragoffset = mouse;
		valid = false;
	}
}

function onGestureEnd(e) {
	var mouse = getMouse(e);
    scaling *= e.scale;
    valid = false;
}

function show_add_popup() {
	document.getElementById('addNodeMask').style.display = "block";
	$('#addPrimitivePopup').html('');
	var html = '';
	var primitives = load_primitives(server_url);
	function add_click(entry, cat, nam, obj) {
		entry.on('click', function() {
			if(cat == 'literal') {
				global_nodes.push(new RWSLiteral(nam, obj));
			} else {
				global_nodes.push(new RWSPrimitive(cat, nam, obj));
			}
	    	document.getElementById('addNodeMask').style.display = "none";
	    	valid = false;
		});
	}

	for(var category in primitives) {
		$('#addPrimitivePopup').append('<p><strong>' + category + '</strong></p>');
		var list = $('<ul>')
		$('#addPrimitivePopup').append(list);
		for(var name in primitives[category]) {
			var entry = $('<li class="smapEntry" >' + name + '</li>')
			list.append(entry);
			add_click(entry, category, name, primitives[category][name]);

		}
		$('#addPrimitivePopup').append('</ul>');
		$('#addPrimitivePopup').append('<hr>');
	}
}

function nodeInfoPopup(node) {
	document.getElementById('nodeInfoMask').style.display = "block";
	$('#nodeInfoPopup').html('');
	node.populateInfoPopup($('#nodeInfoPopup'));
	$('#nodeInfoPopup').on('click', function(e) {
		e.stopPropagation();
	});
	$('#nodeInfoMask').on('click', function() {
		document.getElementById('nodeInfoMask').style.display = "none";
	});

}


function send_model() {
	export_application(global_nodes, global_wires, server_url);
}



window.addEventListener("DOMContentLoaded", function() {
    canvas = $('canvas')[0];
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchmove', onMouseMove, false);
    canvas.addEventListener('gestureend', onGestureEnd, false);
	setInterval(visualize, 50);
}, false);