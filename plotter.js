
//Initial testing for converting the example CSV files into JavaScript objects to easily be used in visualization
function convertCSVToObjs(csvContents){
	var lines = csvContents.split("\n");
	if(lines.length < 1)
		return [];
	var extractedObjects = [];
	var headerElements = lines[0].split(",");
	for(var i = 1; i < lines.length; i++){
		var currObject = {};
		var currLine = splitOuter(lines[i], ',');
		if(currLine.length != headerElements.length){
			console.log("Inspect current line; splitOuter does not return correct value.");
			return;			
		}
		for(var j = 0; j < headerElements.length; i++){
			currObj[j] = currLine[j];
		}
		currObj.label = currObj[0];
		currObj.tweetObject = JSON.parse(currObj[1]);
		currObj.inferedPoint = JSON.parse(currObj[2]);
		currObj.localTime = currObj[3];
		extractedObjects.push(currObj);
	}
	return extractedObjects;
}

//Function to retrieve the local time only (not including date)
function getTime(csvObject){
	console.log(csvObject.localTime);
	var comps = csvObject.localTime.split(" ");
	var localTime = comps[3];
	return localTime;
}

//Function to retrieve the date only (not including the local time) 
function getDate(csvObject){
	var comps = csvObject.localTime.split(" ");
	return comps[1] + " " + comps[2] + " " + comps[5];
}

function getLocation(csvObject){
	//Maybe convert to GeoJSON format? Or just do something with the JSON information that is already available?
}


//With CSV files that aren't pre-sorted/filtered but are labeled as (1) related or (0) unrelated, just retrieve the desired objects
function filterLabel(csvObjects, desiredLabel){
	var filtered = [];
	for(var i = 0; i < csvObjects.length; i++){
		if(csvObjects[i].label == desiredLabel) {
			filtered.push(csvObjects[i]);
		}
	}
	return filtered;
}

//Custom function to split the example CSV file without external libraries. To fix any errors where the internal commas would 
//interfere (such as within the tweet_object and infered_point columns), I make sure that the commas are outside of any object
function splitOuter(str, delimiter){
	var numOpenings = 0;
	var splitResult = [];
	var startIndex = 0;
	for(var i = 0; i < str.length; i++){
		if(str.charAt(i) == delimiter && numOpenings == 0){
			splitResult.push(str.substring(startIndex, i-1));
			startIndex = i+1;
		} else if (str.charAt(i) == '{') {
			numOpenings++;
		} else if (str.charAt(i) == '}') {
			numOpenings--;
		}
	}
	splitResult.push(str.substring(startIndex));
	return splitResult;
}


//PAGE ELEMENTS

function updateMap(map, newPos, newZoom){
	map.panTo(newPos, newZoom);
}

function handleFileSelect(event){
	event.stopPropagation();
	event.preventDefault();
	var file = event.dataTransfer.files[0];
	console.log(event.dataTransfer.files.length);
	console.log(document.getElementById("fileSelector").value);
	document.getElementById("fileSelector").innerHTML = file.name;

}
function handleDragOver(event){
	event.stopPropagation();
	event.preventDefault();
	event.dataTransfer.dropEffect = "copy";
}

window.onload = function(){
	//Map
	var map = L.map("map").setView([35,-95],3);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox.streets',
	    accessToken: 'pk.eyJ1IjoiamxoMjkiLCJhIjoiY2p1a3lncDdxMHI1MTQzbzR0NDN4bDdxciJ9.v5aYG6rQPqpJONdRVSiRZw'
	}).addTo(map);


	//Drag and drop zone
	var dropZone = document.getElementById("dropZone");
	dropZone.addEventListener("dragover", handleDragOver, false);
	dropZone.addEventListener("drop", handleFileSelect, false);







	//AnalyzeButton
	document.getElementById("analyzeButton").addEventListener("click", function(){
		if(document.getElementById("fileSelector").files.length == 0){
			alert("Please select a file!");
			return;
		} 
		var inFile = document.getElementById("fileSelector").files[0];
		for(var i = inFile.name.length-1; i >= 0; i--){
			if(inFile.name.charAt(i) == '.'){
				if(inFile.name.substring(i).toLowerCase() != ".csv") {
					alert("Please select a CSV file");
					return;
				} else {
					break;
				}
			}
		}
		//var tweets = convertCSVToObjs(csvContents);
		//Get midpoint of all tweets
		midpoint = [40.7128, -74.0060];
		updateMap(map, midpoint, 7);
		var tweetLayer = L.geoJSON().addTo(map);
		var reader = new FileReader();
		var csvText = "";
		reader.onload = function(e) {
			csvText = reader.result;

			var tweets = convertCSVToObjs(csvText);
			console.log(tweets.length);
		};
		reader.readAsText(inFile);

		////When we have the file input done, we can use this
		//Also need to take care of duplicates and add popup labels
		/*for(var i = 0; i < tweets.length; i++){
			tweetLayer.addData(getGeoJSONLocation(tweets[i]));
		}
		*/
		var tempTweetLocations = [
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-74.24545549999999, 40.6242735], "type": "Point"},
		{"coordinates": [-73.977717, 40.705597499999996], "type": "Point"},
		{"coordinates": [-74.066663, 40.7180015], "type": "Point"},
		{"coordinates": [-74.066663, 40.7180015], "type": "Point"},
		{"coordinates": [-74.0108855, 40.787364999999994], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-74.066663, 40.7180015], "type": "Point"},
		{"coordinates": [-74.184848, 40.734494], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-74.1581305, 40.859832], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-74.184848, 40.734494], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-74.1581305, 40.859832], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-74.16780750000001, 40.915047], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-74.19652450000001, 40.662479], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-73.82938399999999, 40.912499], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-74.184848, 40.734494], "type": "Point"},
		{"coordinates": [-74.19652450000001, 40.662479], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-74.0245075, 40.7905115], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-73.9718795, 40.8895505], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-74.184848, 40.734494], "type": "Point"},
		{"coordinates": [-74.19652450000001, 40.662479], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-74.214139, 40.766601], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-74.184848, 40.734494], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-74.19652450000001, 40.662479], "type": "Point"},
		{"coordinates": [-73.9718795, 40.8895505], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.86085700000001, 40.944567500000005], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-74.066663, 40.7180015], "type": "Point"},
		{"coordinates": [-73.94347789, 40.82757207], "type": "Point"},
		{"coordinates": [-74.030317, 40.76662], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-74.046402, 40.885965999999996], "type": "Point"},
		{"coordinates": [-73.9920625, 40.7145515], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-73.993189, 40.945262], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-74.16780750000001, 40.915047], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-74.066663, 40.7180015], "type": "Point"},
		{"coordinates": [-74.066663, 40.7180015], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-74.16780750000001, 40.915047], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-74.066663, 40.7180015], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-74.1188015, 40.936252499999995], "type": "Point"},
		{"coordinates": [-74.06378699999999, 40.778489], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"},
		{"coordinates": [-73.8311875, 40.6708795], "type": "Point"},
		{"coordinates": [-74.032258, 40.7463795], "type": "Point"},
		{"coordinates": [-74.19652450000001, 40.662479], "type": "Point"},
		{"coordinates": [-74.16780750000001, 40.915047], "type": "Point"},
		{"coordinates": [-73.9685415, 40.780709], "type": "Point"},
		{"coordinates": [-73.86085700000001, 40.944567500000005], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-73.9487755, 40.655138], "type": "Point"},
		{"coordinates": [-74.16780750000001, 40.915047], "type": "Point"},
		{"coordinates": [-73.8494415, 40.8503475], "type": "Point"}
		];
		for(var i = 0; i < tempTweetLocations.length; i++){
			tweetLayer.addData(tempTweetLocations[i]);
		}
		map.fitBounds(tweetLayer.getBounds());



		
		
	});

};
