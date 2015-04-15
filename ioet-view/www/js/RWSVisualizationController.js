available_nodes = [];
var wires = [];
var selected = null;
var dragging = false;
var dragoffx = 0;
var dragoffy = 0;


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
	if(canvas) {
		var ctx = canvas.getContext('2d');
		clear(ctx);
		available_nodes.forEach(function(node) {
			node.draw(ctx);
		});
	}
}

function find_nearby_nodes() {
	//here we look for nearby nodes using smap
	//hardcoded for now
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
        	visualize();
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
	    dragging = false;
		available_nodes.forEach(function(node) {
			if(node.contains(mouse)) {
				selected = node;
				dragging = true;
				dragoffset = mouse;
			}
		});
	}
}

function onMouseMove(e) {
	var canvas = $('canvas')[0];
	if(canvas && dragging) {
		e.preventDefault();
		var mouse = getMouse(e);
		var deltaX = mouse.x - dragoffset['x'];
		var deltaY = mouse.y - dragoffset['y'];
		selected.x += deltaX;
		selected.y += deltaY;
		dragoffset = mouse;
	}
}



window.addEventListener("DOMContentLoaded", function() {
    canvas = $('canvas')[0];
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchmove', onMouseMove, false);
	setInterval(visualize, 50);
}, false);