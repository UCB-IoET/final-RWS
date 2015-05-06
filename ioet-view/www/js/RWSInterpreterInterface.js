function RWSInterpreterInterface(server_url) {
  this.server_url = server_url;

  this.export_application = function(application) {
    var exportObject = application.getExportRepresentation();

    json_dict = JSON.stringify(exportObject);
    console.log(json_dict)
    $.ajax({
       type: 'POST',
       url: this.server_url+'/new',
       data: json_dict,
       success: function(data) {
          print(data)
          window.open("menu.html",'_self');
       },
       async:true
    });

  }
}
