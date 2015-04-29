function export_application(application, server_url) {
    var exportObject = application.getExportRepresentation();
    
    console.log(JSON.stringify(exportObject));

    json_dict = JSON.stringify(exportObject);

    $.ajax({
       type: 'POST',
       url: server_url,
       data: json_dict,
       success: function(data) {
          print(data)
       }
       ,
       async:true
    });

}