var mainURL = "http://localhost:8280/graph/1.0.0/";
var token = "Bearer daf3342bd3b895575ad165df51b06b2e";
var queryLine =[];




function loadRelationships (node) {
			var query =  $("#cypherQuery").val();

            url = mainURL +"node/"+node+"/relationships/all";

            $.ajax(url, {
				type: "GET",
				
				          headers : {
                          'Authorization' : token
                        },
				contentType: "application/json",
				error: function(err) {
					alert(err);
				},
				success: function(res) {

						  $('#selectRelationship')
				          .find('option')
				          .remove()
				          .end();

						res.forEach(function(row){
						$('#selectRelationship')
						         .append($("<option></option>")
						         .attr("value", row.type)
						         .text(row.type)); 
					});


					
				}
			});
}

function loadFilterNodesCombo(label)
{
		var query =  $("#cypherQuery").val();

            url = mainURL +"label/"+label+"/nodes";

            $.ajax(url, {
				type: "GET",
				
				          headers : {
                          'Authorization' : token
                        },
				contentType: "application/json",
				error: function(err) {
					alert(err);
				},
				success: function(res) {

						 $('#selectFilterNode')
				          .find('option')
				          .remove()
				          .end();

						res.forEach(function(row){
						$('#selectFilterNode')
						         .append($("<option></option>")
						         .attr("value", row.paged_traverse.split("/")[6])
						         .text(row.data.name)); 
					});


					
				}
			});
}

function loadLabelCombos() {
	var query =  $("#cypherQuery").val();

            url = mainURL +"labels";

            $.ajax(url, {
				type: "GET",
				
				          headers : {
                          'Authorization' : token
                        },
				contentType: "application/json",
				error: function(err) {
					alert(err);
				},
				success: function(res) {


						$('#selectFilterNodeLabel')
				          .find('option')
				          .remove()
				          .end();

				         $('#selectOutputNodeLabel')
				          .find('option')
				          .remove()
				          .end();

						res.forEach(function(row){
						$('#selectFilterNodeLabel')
						         .append($("<option></option>")
						         .attr("value",row)
						         .text(row)); 

						$('#selectOutputNodeLabel')
						         .append($("<option></option>")
						         .attr("value",row)
						         .text(row)); 

					});


					
				}
			});
}


$(document).ready(function(){

loadLabelCombos();

 $("#btnAdd").click(function(){
  	
  	queryLine[queryLine.length] = JSON.parse('{"selectFilterNodeLabel":"'
  						+$('#selectFilterNodeLabel').val()+'","selectOutputNodeLabel":"'
  						+$('#selectOutputNodeLabel').val()+'","selectFilterNode":"'
  						+$('#selectFilterNode option:selected').text()+'","selectRelationship":"'+$('#selectRelationship').val()+'"}');

 	});

  $("#btnClear").click(function(){ 

  		queryLine = [];

  });


  $("#selectFilterNodeLabel").change(function() {
  		loadFilterNodesCombo($("#selectFilterNodeLabel").val());
});

  $("#selectFilterNode").change(function() {
  		loadRelationships($("#selectFilterNode").val());
});


  $("#btnQuery").click(function(){
			  	var query = "MATCH ";

			  	var counter = 0;

			  	queryLine.forEach(function(row) {
			  		query += "("+row['selectFilterNodeLabel']+" { name:'"+row['selectFilterNode']+"' })-["+row['selectRelationship']+"]-("+row['selectOutputNodeLabel']+")";
			  		counter++;

			  		if (counter != queryLine.length)
			  		{
			  			query += ","
			  		}
			  	});

			  	query += "RETURN ";
			  	counter = 0;

			  	queryLine.forEach(function(row) {
			  		query += row['selectOutputNodeLabel'];

			  		counter++;

			  		if (counter != queryLine.length)
			  		{
			  			query += ","
			  		}
			  	});

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
                          'Authorization' : token
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

						row["graph"]["nodes"].forEach(function(graphRow){
					
							var id = graphRow["id"];
							var label = graphRow["labels"][0];
							var nodeName = graphRow["properties"]["name"];
							var longitute = graphRow["properties"]["longitute"];
							var latitude = graphRow["properties"]["latitude"];

							nodes[counter] = '{"id" : '+id+', "label":"'+label+'", "name":"'+nodeName+'", "longitute":'+longitute+',"latitude":'+latitude+', "distance":'+0+' }';

							counter = counter + 1;
						});
					});

					//Remove duplicate nodes
					var uniqueNodes = [];
					$.each(nodes, function(i, el){
					    if($.inArray(el, uniqueNodes) === -1) uniqueNodes.push(el);
					});

					
					//Calculate distance from item 1 to other items.
					for ( i = 0; i < uniqueNodes.length; i++) {
						uniqueNodes[i] = JSON.parse(uniqueNodes[i]); 
						uniqueNodes[i]["distance"] = calculateDistance(uniqueNodes[0]["latitude"],uniqueNodes[0]["longitute"],uniqueNodes[i]["latitude"],uniqueNodes[i]["longitute"],"K");
					};

					//sort by to distance
					uniqueNodes.sort(function(a, b) { 
  						return a.distance - b.distance;
					});



					$("#resultText").empty();
					$("#gui-reset").click();

					queryLine =[];

					//Set start location
					OSRM.Geocoder.call(OSRM.C.SOURCE_LABEL, source);

					counter = 0;
					uniqueNodes.forEach(function(row){
						counter = counter+ 1;

						$("#resultText").append('<li>'+ counter + " - "+ row["label"] + " - " + row["name"]+'</li>');

						//set via location for each graph node
						OSRM.Geocoder.call(OSRM.C.VIA_LABEL, row["latitude"] + " , " + row["longitute"]);

					});

					//Set end location
					OSRM.Geocoder.call(OSRM.C.TARGET_LABEL, target);
				}
			});

	});
});


function calculateDistance(lat1, lon1, lat2, lon2, unit) {
	    var radlat1 = Math.PI * lat1/180
	    var radlat2 = Math.PI * lat2/180
	    var radlon1 = Math.PI * lon1/180
	    var radlon2 = Math.PI * lon2/180
	    var theta = lon1-lon2
	    var radtheta = Math.PI * theta/180
	    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	    dist = Math.acos(dist)
	    dist = dist * 180/Math.PI
	    dist = dist * 60 * 1.1515
	    if (unit=="K") { dist = dist * 1.609344 }
	    if (unit=="N") { dist = dist * 0.8684 }
	    return dist
	}
