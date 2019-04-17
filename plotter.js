
//Initial testing for converting the example CSV files into JavaScript objects to easily be used in visualization
//Type 1: label, tweet_object, infered_point, local_time
//Type 2: ID, userID, date, Followers, Friends, Statuses, Lat, Long, Text, Class, BoroCode, BoroName, NTAName, CenstracID

function convertCSVToObjs(csvContents, csvType = 1){
	var debug = false;

	var lines = csvContents.split("\n");
	if(lines.length < 1)
		return [];
	var extractedObjects = [];
	var headerElements = lines[0].split(",");
	if(debug)
		console.log("This file has " + headerElements.length + " columns");
	if(csvType == 0){
		switch(headerElements.length){
			case 4: 
				csvType = 1;
				break;
			case 14:
				csvType = 2;
				break;
			default:
				alert("This file is in an unrecognized format.");
				return;
		}
	}
	for(var i = 1; i < lines.length; i++){
		if(lines[i].length == 0)
			continue;
		if(i%10 == 0&&debug){
			console.log("Processing line " + i);
		}
		var currObj = {};
		var currLine = (csvType == 2 && lines[i].split(",").length == headerElements.length)?lines[i].split(","):splitOuter(lines[i], ',', csvType);
		if(currLine.length != headerElements.length){
			console.log("Inspect current line; splitOuter does not return correct value.");
			console.log(lines[i]);
			console.log(currLine);
			return;			
		}
		if(csvType == 1){
			currObj.label = currLine[0];
			currObj.tweetObject = JSON.parse(currLine[1]);
			currObj.inferedPoint = JSON.parse(currLine[2]);
			currObj.inferedPointStr = currLine[2];
			currObj.localTime = currLine[3];
			extractedObjects.push(currObj);
		} else if(csvType == 2){
			//Class => label
			currObj.label = currLine[9];
			currObj.id = currLine[0];
			currObj.tweetObject = {};
			currObj.tweetObject.userID = currLine[1];
			currObj.tweetObject.followers = currLine[3];
			currObj.tweetObject.friends = currLine[4];
			currObj.tweetObject.statuses = currLine[5];
			currObj.tweetObject.text = currLine[8];
			currObj.inferedPointStr = "{\"coordinates\":["+currLine[7]+","+currLine[6]+"], \"type\": \"Point\"}";
			currObj.inferedPoint = JSON.parse(currObj.inferedPointStr);
			currObj.boro = {};
			currObj.boro.code = currLine[10];
			currObj.boro.name = currLine[11];
			currObj.boro.ntaName = currLine[12];
			currObj.censtracID = currLine[13];
			currObj.localTime = currLine[2];
			extractedObjects.push(currObj);
		} else {
			console.log("Invalid CSV conversion type");
			return;
		}
	}

	return extractedObjects;
}

//Function to retrieve the local time only (not including date)

//NEEDS TO BE UPDATED FOR BOTH TYPES OF FILES
function getTime(csvObject){
	console.log(csvObject.localTime);
	var comps = csvObject.localTime.split(" ");
	var localTime = comps[3];
	return localTime;
}

//Function to retrieve the date only (not including the local time) 

//NEEDS TO BE UPDATED FOR BOTH TYPES OF FILES
function getDate(csvObject){
	var comps = csvObject.localTime.split(" ");
	return comps[1] + " " + comps[2] + " " + comps[5];
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
function splitOuter(str, delimiter, csvType = 1){
	var fixedStr = stripExtraQuotes(str, ((csvType==1)?false:true));
	var numOpenings = 0;
	var inQuote = false;
	var splitResult = [];
	var startIndex = 0;
	for(var i = 0; i < fixedStr.length; i++){
		if(csvType==1){
			if(fixedStr.charAt(i) == delimiter && numOpenings == 0){
				splitResult.push(fixedStr.substring(startIndex, i));
				startIndex = i+1;
			} else if (fixedStr.charAt(i) == '{') {
				numOpenings++;
			} else if (fixedStr.charAt(i) == '}') {
				numOpenings--;
			}
		} else {
			if(fixedStr.charAt(i) == delimiter && numOpenings == 0 && inQuote == false){
				splitResult.push(fixedStr.substring(startIndex, i));
				startIndex = i+1;
			} else if (fixedStr.charAt(i) == '{') {
				numOpenings++;
			} else if (fixedStr.charAt(i) == '}') {
				numOpenings--;
			} else if (fixedStr.charAt(i) == '\"') {
				inQuote = !inQuote;
			}
		}
	}
	splitResult.push(fixedStr.substring(startIndex));
	return splitResult;
}

function stripExtraQuotes(str, onlyDouble = false){
	var tempStr = "";
	var startIndex = 0;
	for(var i = 0; i < str.length; i++){
		if(str.charAt(i) == '"'){
			if(onlyDouble){
				if(str.charAt(++i) == '"'){
					tempStr += str.substring(startIndex, i-1);
					i++;
					startIndex = i;
				}
			} else {
				tempStr += str.substring(startIndex, i);
				i++;
				startIndex = i;
			}
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
		if(numAtLocation.has(tweetObjects[i].inferedPointStr)){
			numAtLocation.set(tweetObjects[i].inferedPointStr, numAtLocation.get(tweetObjects[i].inferedPointStr)+1);
		} else {
			numAtLocation.set(tweetObjects[i].inferedPointStr, 1);
		}
	}
	var i = 0;
	for(var key of numAtLocation.keys()){
		try{
			var currPos = JSON.parse(key);
		} catch {
			console.log("Error on key: " + key);
		}
		currPos.numAtLocation = numAtLocation.get(key);
		geoJSONLayer.addData(currPos);
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
	var layerGroup = L.layerGroup().addTo(map);


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
		layerGroup.clearLayers();
		var tweetLayer = L.geoJSON(null, {onEachFeature: function(feature, layer){layer.bindPopup("<b>There " + ((feature.numAtLocation > 1)?"are ":"is ") + feature.numAtLocation + " Tweet" + ((feature.numAtLocation>1)?"s":"") + " from this location</b>");}}).addTo(layerGroup);
		var reader = new FileReader();
		var csvText = "";
		reader.onload = function(e) {
			csvText = reader.result;
			var radioButton = document.querySelector("input[name=\"csvTypeRadio\"]:checked");
			var csvType = (radioButton==null)?0:radioButton.value;
			var tweets = convertCSVToObjs(csvText, csvType);
			console.log("Gathered " + tweets.length + " tweets");
			addLocationMarkers(tweets, tweetLayer);

			map.fitBounds(tweetLayer.getBounds());
			
		};
		reader.readAsText(inFile);
		
	});

};
