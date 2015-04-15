available_nodes = [];
var wires = [];
var selected = null;


// function refreshVisualization() {
// 	visNodes = [];

// 	available_nodes.forEach(function (node) {
// 		visNodes.push(new VisualizationNode(node));
// 	});

// 	visualize();
// }

function clear(ctx) {
   	ctx.clearRect(0, 0, canvas.width, canvas.height);   
 }


function visualize() {
	if(canvas) {
		var ctx = canvas.getContext('2d');
		clear(ctx);
		available_nodes.forEach(function(node) {
			node.draw(ctx);
		})
	}
}

function find_nearby_nodes() {
	//here we look for nearby nodes using smap
	//hardcoded for now
	smap = new RWSSMAPInterface('http://shell.storm.pm:8079/api/query', available_nodes);
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

window.addEventListener("DOMContentLoaded", function() {
    canvas = $('canvas')[0];
}, false);