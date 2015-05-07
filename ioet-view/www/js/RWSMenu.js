var username = window.localStorage.getItem('uid') || 'User';
var server_url = "http://shell.storm.pm:14588";

function load_applications() {
	var key;
	var loaded_applications = ['New Application'];
	var programs = window.localStorage.getItem("storedPrograms");
	if(programs != null) {
		programs = JSON.parse(programs)
		for(key in programs) {	 //load from local storage here
			if(programs[key]['uid'] == username) {
				loaded_applications.push(programs[key]);
			}
		}
	}
	return loaded_applications;
}

function populate_application(app, index, jquery_obj) {
	if(app == 'New Application') {
		return $('<div class="application" id="New Application"><h3> New Application </h3></div>');
	}
	if(!jquery_obj) {
		jquery_obj = $('<div class="application" id="app'+index+'">');
	}
	jquery_obj.html('');
	jquery_obj.append('<h3>'+app['app_id']+'</h3>\n');
	if(app['status']){
		jquery_obj.append('<br>\n');
		jquery_obj.append('Status: '+app['status']+'\n<br>\n');
		if(app['status'] != 'running') {
			$('<button class="rwsButton"> Start App </button>').appendTo(jquery_obj).click(function(e) {
				$.post(server_url + '/start', JSON.stringify({'uid': username, 'pid': app['app_id'], 'password': 'password'}), function(data) {
					update_app_status(app, index);
					navigator.notification.alert(data, function() {}, 'Result');
				});
				e.stopPropagation();
			});
		} else {
			$('<button class="rwsButton"> Stop App </button>').appendTo(jquery_obj).click(function(e) {
				$.post(server_url + '/stop', JSON.stringify({'uid': username, 'pid': app['app_id'], 'password': 'password'}), function(data) {
					update_app_status(app, index);
					navigator.notification.alert(data, function() {}, 'Result');
				});
				e.stopPropagation();
			});
		}
		//add the delete button
		$('<button class="closeButton"> x </button>').prependTo(jquery_obj)
			.offset(jquery_obj.offset())
			.click(function(e) {
				$.post(server_url + '/delete', JSON.stringify({'uid': username, 'pid': app['app_id'], 'password': 'password'}), function(data) {
					var programs = window.localStorage.getItem("storedPrograms");
					programs = JSON.parse(programs)
					delete programs[app.app_id];
					window.localStorage.setItem("storedPrograms", JSON.stringify(programs));
					clearInterval(app['app_watcher']);
					populate_applications();
				});
				e.stopPropagation();
			});

	}
	return jquery_obj;
}

function update_app_status(app, index) {
	if(app != 'New Application')
		$.post(server_url + '/status', JSON.stringify({'uid': username, 'pid': app['app_id'], 'password': 'password'}), function(data) {
			app['status'] = data;
			populate_application(app, index, $('#app'+index));
		}).fail(function() {
			delete app['status'];
			populate_application(app, index, $('#app'+index));
		});

}

function updateUsername() {
	username = $('#username').val();
	$('#userDisplay').html('Username: ' + username);
	window.localStorage.setItem("uid", username);
	populate_applications();
	return false;
}

function getNewAppName(applications) {
	var i = 1;
	var found = true;
	while(found) {
		found = false;
		for(var index in applications) {
			if(applications[index]['app_id'] == 'App '+i) {
				i++;
				found = true;
				break;
			}
		}
	}
	return 'App ' + i;
}

function createApplication(index, applications) {
	var app = applications[index];
	var jquery_obj = populate_application(app, index);
	jquery_obj.appendTo('#appContainer').click(function(event) {
			window.localStorage.setItem("selectedProgram", app['app_id'] || getNewAppName(applications));
			window.open("edit.html",'_self');
		});
	var timer;
	jquery_obj.on("touchstart",function(e){
	    timer = setTimeout(function(){
	        alert('open app info popup');
	    }, 1000);
	}).on("touchend",function(){
	    clearTimeout(timer);
	});
	if(app['app_watcher']) {
		clearInterval(app['app_watcher'])
	}
	app['app_watcher'] = window.setInterval(update_app_status, 5000, app, index);

}

function populate_applications() {
	$('#appContainer').html('');
	var applications = load_applications();
	for(var index in applications) {
		createApplication(index, applications);
	}
}

$(document).ready(function() {
	document.body.style.webkitUserSelect='none';
	populate_applications();
	$('#userDisplay').html('Username: ' + username);
	$('#username').change(updateUsername);
	$('#userForm').submit(updateUsername);
});