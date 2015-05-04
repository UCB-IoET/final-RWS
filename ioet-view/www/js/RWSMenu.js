var username = 'Client';

function load_applications() {
	var key;
	var loaded_applications = ['New Application'];
	var programs = window.localStorage.getItem("storedPrograms");
	if(programs != null) {
		programs = JSON.parse(programs)
		for(key in programs) {	 //load from local storage here
			loaded_applications.push(programs[key]);
		}
	}
	return loaded_applications;
}

function html_for_application(app) {
	if(app == 'New Application') {
		return '<div class="application" id="New Application"> New Application </div>';
	}
	var html = '<div class="application" id="app' + app['app_id'] + '">';
	html += '<h3>'+app['app_id']+'</h3>\n';
	if(app['status']){
		html += '<br>\n';
		html += 'Status: '+app['status']+'\n';
	}
	html += '</div>';
	return html;
}

function update_app_status(app) {
	if(app != 'New Application')
		$.post('http://localhost:1458/status', JSON.stringify({'uid': username, 'pid': app['app_id'], 'password': 'password'}), function(data) {
			app['status'] = data;
			$('#app'+app['app_id']).html(html_for_application(app));
		}).fail(function() {
			delete app['status'];
			$('#app'+app['app_id']).html(html_for_application(app));
		});

}

$(document).ready(function() {
	var applications = load_applications();
	for(var index in applications) {
		var app = applications[index];
		var jquery_obj = $(html_for_application(app));
		jquery_obj.appendTo('body').click(function(event) {
			window.localStorage.setItem("selectedProgram", app['app_id'] || 'New Application');
			window.open("edit.html",'_self');
		});
		app['app_watcher'] = window.setInterval(update_app_status, 5000, app);
	}

	$('#username').change(function() {
		username = $('#username').val()
		window.localStorage.setItem("uid", username);
	});
});