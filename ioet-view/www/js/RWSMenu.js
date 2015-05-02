var username;



function load_applications() {
	var key;
	var loaded_applications = ['New Application'];
	var programs = window.localStorage.getItem("storedPrograms");
	if(programs != null) {
		programs = JSON.parse(programs)
		for(key in programs) {	 //load from local storage here
			loaded_applications.push(key);
		}
	}
	return loaded_applications;
}

$(document).ready(function() {
	var applications = load_applications();
	for(var index in applications) {
		var appName = applications[index];
		$('<div class="application">'+appName+'</div>').appendTo('body').click(function(event) {
			console.log("clicked: ", $(event.target).html());
			window.localStorage.setItem("selectedProgram", String($(event.target).html()));
			window.open("edit.html",'_self');
		});
	}

	$('#username').change(function() {
		username = $('#username').val()
		window.localStorage.setItem("uid", username);
	});
});