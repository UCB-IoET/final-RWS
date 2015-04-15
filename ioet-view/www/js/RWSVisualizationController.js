available_nodes = [];
var wires = [];
var selected = null;


function refreshVisualization() {
	visNodes = [];

	available_nodes.forEach(function (node) {
		visNodes.push(new VisualizationNode(node));
	});

	visualize();
}

function visualize() {
	var svgContainer = d3.select('svg');

	//returns all the nodes
	var nodeGs = svgContainer.selectAll("g")
		.data(visNodes);

	//only the new nodes that just got added
	var nodeEnter = nodeGs.enter().append("g");
	nodeGs
		.attr('transform', function(d) { return 'translate( ' + d.x + ',' + d.y +')'; })
		.attr('class', 'node')
		.on('mousedown', function() {
			if(selected && selected.node.id != this.__data__.node.id) {
				wires.push(new RWSWire(selected, this.__data__));
				selected.selected = false;
				selected = null;
				visualize()
			} else if(selected) {
				selected.selected = false;
				selected = null;
			} else {
				this.__data__.selected = true;
				selected = this.__data__;
			}
			visualize()
		});
	//Add circles
	nodeEnter.append("circle")

	//all the circle elements
	var circles = nodeGs.selectAll("circle");
	var circleAttributes = circles
		.attr("cx", function (d) { return 0; })
		.attr("cy", function (d) { return 0; })
		.attr("r", function (d) { return d.r; })
		.attr("fill", "purple")
		.style("filter", function(d) { 
			if(selected && selected.node.id == d.node.id) {
				return "url(#glow)";
			}
			return "";
		});

	
	nodeEnter.append("text");

	//all the text elements
	var texts = nodeGs.selectAll("text");
	//Add Labels
	var textLabels = texts
	    .attr("dy", ".35em")
		.text(function (d) { return d.node.name; })
		.style("font-size", function(d) {
        	return "12px"; 
       	})
		.attr("y", function(d) { return 0; })
		.attr("x", function(d) { return - this.getComputedTextLength()/2; })


	var links = svgContainer.selectAll("line")
		.data(wires);

	var linksEnter = links.enter().append("line");
	links
		.attr("x1", function(d) { return d.source.x})
		.attr("y1", function(d) { return d.source.y})
		.attr("x2", function(d) { return d.target.x})
		.attr("y2", function(d) { return d.target.y})
		.attr("stroke-width", 2)
		.attr("stroke", "black");

}

function show_add_popup() {
	document.getElementById('addNodeMask').style.display = "block";
}

function add_node() {
	var name = d3.select('#addNodeName').property('value');
	var type = d3.select('#addNodeType').property('value');
	var node = new RWSSensor(name);
	available_nodes.push(node);
	visNodes.push(new VisualizationNode(node));
	d3.select('#addNodeName').property('value','');
	d3.select('#addNodeType').property('value','');
	document.getElementById('addNodeMask').style.display = "none";
	visualize();
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
    refreshVisualization()
}, false);