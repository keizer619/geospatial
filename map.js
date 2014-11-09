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
					var nodes = [];


					
					res.results[0].data.forEach(function(row) {
					//	OSRM.Geocoder.call(OSRM.C.VIA_LABEL, row["row"][0]["latitude"] + " , " + row["row"][0]["longitute"]);
					//	
					//	$("#resultText").append('<li>'+ counter + " - "+ row["graph"]["nodes"][0]["labels"][0] + " - " + row["row"][0]["name"]+'</li>');


						row["graph"]["nodes"].forEach(function(graphRow){
					
							var id = graphRow["id"];
							var label = graphRow["labels"][0];
							var nodeName = graphRow["properties"]["name"];
							var longitute = graphRow["properties"]["longitute"];
							var latitude = graphRow["properties"]["latitude"];

							nodes[counter] = '{"id" : '+id+', "label":"'+label+'", "name":"'+nodeName+'", "longitute":'+longitute+',"latitude":'+latitude+'}';

							counter = counter + 1;
						});
					});



					//Remove duplicate nodes
					var uniqueNodes = [];
					$.each(nodes, function(i, el){
					    if($.inArray(el, uniqueNodes) === -1) uniqueNodes.push(el);
					});


					$("#resultText").empty();
					$("#gui-reset").click();
					OSRM.Geocoder.call(OSRM.C.SOURCE_LABEL, source);

					counter = 0;
					uniqueNodes.forEach(function(row){
						counter = counter+ 1;
						row = JSON.parse(row); 

						$("#resultText").append('<li>'+ counter + " - "+ row["label"] + " - " + row["name"]+'</li>');
						OSRM.Geocoder.call(OSRM.C.VIA_LABEL, row["latitude"] + " , " + row["longitute"]);

					});

					OSRM.Geocoder.call(OSRM.C.TARGET_LABEL, target);
					$("#gui-input-target").change();

					var x = "x";


				}
			});

	});
});
