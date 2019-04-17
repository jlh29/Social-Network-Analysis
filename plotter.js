
//Initial testing for converting the example CSV files into JavaScript objects to easily be used in visualization
function convertCSVToObjs(csvContents){
	var lines = csvContents.split("\n");
	if(lines.length < 1)
		return [];
	var extractedObjects = [];
	var headerElements = lines[0].split(",");
	console.log("This file has " + headerElements.length + " columns");
	for(var i = 1; i < lines.length; i++){
		if(lines[i].length == 0)
			continue;
		if(i%10 == 0){
			console.log("Processing line " + i);
		}
		var currObj = {};
		var currLine = splitOuter(lines[i], ',');
		if(currLine.length != headerElements.length){
			console.log("Inspect current line; splitOuter does not return correct value.");
			console.log(lines[i]);
			console.log(currLine);
			return;			
		}
		currObj.label = currLine[0];
		currObj.tweetObject = JSON.parse(currLine[1]);
		currObj.inferedPoint = JSON.parse(currLine[2]);
		currObj.localTime = currLine[3];
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
	var fixedStr = stripExtraQuotes(str);
	var numOpenings = 0;
	var splitResult = [];
	var startIndex = 0;
	for(var i = 0; i < fixedStr.length; i++){
		if(fixedStr.charAt(i) == delimiter && numOpenings == 0){
			splitResult.push(fixedStr.substring(startIndex, i));
			startIndex = i+1;
		} else if (fixedStr.charAt(i) == '{') {
			numOpenings++;
		} else if (fixedStr.charAt(i) == '}') {
			numOpenings--;
		}
	}
	splitResult.push(fixedStr.substring(startIndex));
	return splitResult;
}

function stripExtraQuotes(str){
	var tempStr = "";
	var startIndex = 0;
	for(var i = 0; i < str.length; i++){
		if(str.charAt(i) == '"'){
			tempStr += str.substring(startIndex, i);
			i++;
			startIndex = i;
		}
	}
	tempStr += str.substring(startIndex);
	return tempStr;
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

function addLocationMarkers(tweetObjects, geoJSONLayer){
	var numAtLocation = new Map();
	for(var i = 0; i < tweetObjects.length; i++){
		if(numAtLocation.has(tweetObjects[i].inferedPoint)){
			numAtLocation.set(tweetObjects[i].inferedPoint, numAtLocation.get(tweetObjects[i].inferedPoint)+1);
		} else {
			numAtLocation.set(tweetObjects[i].inferedPoint, 1);
		}
	}
	for(var key of numAtLocation.keys()){
		geoJSONLayer.addData(key);
	}
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
		var tweetLayer = L.geoJSON().addTo(map);
		var reader = new FileReader();
		var csvText = "";
		reader.onload = function(e) {
			csvText = reader.result;

			var tweets = convertCSVToObjs(csvText);
			console.log("Gathered " + tweets.length + " tweets");
			addLocationMarkers(tweets, tweetLayer);

			map.fitBounds(tweetLayer.getBounds());
			
		};
		reader.readAsText(inFile);
		
	});

};
