var nodes = [];


function visualize() {
	var svgContainer = d3.select("body").select("#diagram")
	visNodes = [];

	nodes.forEach(function (node) {
		visNodes.push(new VisualizationNode(node));
	});

	var nodeGs = svgContainer.selectAll("g")
		.data(visNodes).enter().append("g");
	nodeGs.attr("transform", function(d, i) { return "translate("+d.x + "," + d.y + ")"; } );

	//Add circles
	var circles = nodeGs.append("circle")

	var circleAttributes = circles
                       .attr("cx", function (d) { return d.x; })
                       .attr("cy", function (d) { return d.y; })
                       .attr("r", function (d) { return d.r; })
                       .style("fill", function(d) { return "purple"; });

	var texts = nodeGs.append("text");

	//Add Labels
	textLabels = texts
	    .attr("dy", ".35em")
		.text(function (d) { return d.node.name; })
		.style("font-size", function(d) {
         return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 16) + "px"; 
       	})
		.attr("y", function(d) { return d.y; })
		.attr("x", function(d) { return d.x - this.getComputedTextLength()/2; })
}

function show_add_popup() {
	document.getElementById('grayMask').style.display = "block";
}

function add_node() {
	var name = d3.select('#addNodeName').property('value');
	var type = d3.select('#addNodeType').property('value');
	nodes.push(new Sensor(name));
	d3.select('#addNodeName').property('value','');
	d3.select('#addNodeType').property('value','');
	document.getElementById('grayMask').style.display = "none";
	visualize();
}