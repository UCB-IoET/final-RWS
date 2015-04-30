function RWSInterpreterInterface(server_url) {
  this.server_url = server_url;

  this.export_application = function(application) {
    var exportObject = application.getExportRepresentation();
    console.log(JSON.stringify(exportObject));

    json_dict = JSON.stringify(exportObject);

    $.ajax({
       type: 'POST',
       url: this.server_url+'/new',
       data: json_dict,
       success: function(data) {
          print(data)
       },
       async:true
    });

  }

  this.monitor_application = function(application) {
    $.ajax({
       type: 'POST',
       url: this.server_url+'/status',
       data: application.app_id,
       success: function(data) {
          console.log('got application state');
          console.log(data);
       },
       async:true
    });
  }

  this.start_application = function(application) {
    $.ajax({
       type: 'POST',
       url: this.server_url+'/start',
       data: application.app_id,
       success: function(data) {
          console.log('successfully started application');
       },
       async:true
    });
  }

  this.stop_application = function(application) {
    $.ajax({
       type: 'POST',
       url: this.server_url+'/stop',
       data: application.app_id,
       success: function(data) {
          console.log('successfully stopped application');
       },
       async:true
    });
  }
}
