var mainURL = "http://localhost:8280/graph/1.0.0/";

$(document).ready(function(){
  $("#btnQuery").click(function(){
			var query =  $("#cypherQuery").val();

            url = mainURL +"transaction/commit";

            $.ajax(url, {
				type: "POST",
				data: JSON.stringify({
					statements: [{
						statement: query,
						parameters: {},
						resultDataContents: ["row", "graph"]
					}]
				}),
				          headers : {
                          'Authorization' : 'Bearer 5f0e0d8c2a5477d4a8e79fa2d34f84a'
                        },
				contentType: "application/json",
				error: function(err) {
					alert(err);
				},
				success: function(res) {

					var source = $("#gui-input-source").val();
					var target = $("#gui-input-target").val();
					var counter = 0;

					$("#resultText").empty();
					$("#gui-reset").click();

					OSRM.Geocoder.call(OSRM.C.SOURCE_LABEL, source);
					
					res.results[0].data.forEach(function(row) {
						OSRM.Geocoder.call(OSRM.C.VIA_LABEL, row["row"][0]["latitude"] + " , " + row["row"][0]["longitute"]);
						counter = counter + 1;
						$("#resultText").append('<li>'+ counter + " - "+ row["graph"]["nodes"][0]["labels"][0] + " - " + row["row"][0]["name"]+'</li>');
					});

					OSRM.Geocoder.call(OSRM.C.TARGET_LABEL, target);
					$("#gui-input-target").change();


				}
			});

	});
});
