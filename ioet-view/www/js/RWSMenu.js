function click_app(e) {
	console.log("clicked app")	
}

function load_applications() {
	var loaded_applications = ['New Application'];
	for(var key in window.localStorage) {	 //load from local storage here
		loaded_applications.push(key)
	}
	return loaded_applications;
}

$(document).ready(function() {
	var applications = load_applications();
	for(var index in applications) {
		var appName = applications[index];

		$('<div class="application">'+appName+'</div>').appendTo('body').click(function(event) {
			console.log("clicked: ", $(event.target).html());
			window.open("edit.html",'_self');
		});
	}
});