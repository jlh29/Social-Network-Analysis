
//Initial testing for converting the example CSV files into JavaScript objects to easily be used in visualization
//Type 1: label, tweet_object, infered_point, local_time
//Type 2: ID, userID, date, Followers, Friends, Statuses, Lat, Long, Text, Class, BoroCode, BoroName, NTAName, CenstracID


//Stores the CSV type of the last read file
var globalCSVType = 1;
var globalFilterDate1 = undefined;
var globalFilterDate2 = undefined;

//This function converts the text from a CSV file that matches one of the predefined formats into 
//an array of "tweet" objects that contain a label (which is a description in Type 2 and
//0 or 1 in Type 1 that represents whether the tweet matches the search), 
//the local time/date (which you can extract a normalized form of through getTime/getDate),
//the "inferedPoint" or geographic location, which is stored as both a JSON string and an object,
//the tweetObject (which may be the actual tweet object or a recreated tweet object) containing
//the tweet text, followers, friends, user ID, etc.,
//and possibly a couple other properties depending on the format of CSV input (like BoroCode, BoroName, etc)

//The format can be seen at the top
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
				globalCSVType = 1;
				break;
			case 14:
				globalCSVType = 2;
				break;
			default:
				alert("This file is in an unrecognized format.");
				return;
		}
	} else {
		globalCSVType = csvType;
	}
	for(var i = 1; i < lines.length; i++){
		if(lines[i].length == 0)
			continue;
		if(i%10 == 0&&debug){
			console.log("Processing line " + i);
		}
		var currObj = {};
		var currLine = (globalCSVType == 2 && lines[i].split(",").length == headerElements.length)?lines[i].split(","):splitOuter(lines[i], ',', globalCSVType);
		if(currLine.length != headerElements.length){
			console.log("Inspect current line; splitOuter does not return correct value.");
			console.log(lines[i]);
			console.log(currLine);
			return;			
		}
		if(globalCSVType == 1){
			currObj.label = currLine[0];
			currObj.tweetObject = JSON.parse(currLine[1]);
			currObj.inferedPoint = JSON.parse(currLine[2]);
			currObj.inferedPointStr = currLine[2];
			currObj.localTime = currLine[3];
			extractedObjects.push(currObj);
		} else if(globalCSVType == 2){
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

//With CSV files that aren't pre-sorted/filtered but are labeled as (1) related or (0) unrelated 
//(or classified by a topic), just retrieve the desired objects 
//Returns an array of tweet objects that match the desiredLabel
function filterLabel(csvObjects, desiredLabel){
	var filtered = [];
	for(var i = 0; i < csvObjects.length; i++){
		if(csvObjects[i].label.toLowerCase() == desiredLabel.toLowerCase()) {
			filtered.push(csvObjects[i]);
		}
	}
	return filtered;
}

function filterDate(csvObjects, desiredDate){
	var filtered = [];
	//sortByTime(csvObjects);
	for(var i = 0; i < csvObjects.length; i++){
		var currDate = new Date(csvObjects[i].localTime);
		if(compareDatesObjs(currDate, desiredDate) == 0){
			filtered.push(csvObjects[i]);
		}
	}
	return filtered;
}

function filterDateRange(csvObjects, minDate, maxDate){
	if(compareDatesObjs(minDate,maxDate) == 0){
		return filterDate(csvObjects, minDate);
	}
	var filtered = [];
	for(var i = 0; i < csvObjects.length; i++){
		var currDate = new Date(csvObjects[i].localTime);
		if(compareDatesObjs(minDate, currDate) <= 0 && compareDatesObjs(currDate, maxDate) <= 0)
			filtered.push(csvObjects[i]);
	}
	return filtered;
}

//Custom function to split the example CSV file without external libraries. 
//To fix any errors where the internal commas would interfere 
//(such as within the tweet_object and infered_point columns), 
//I make sure that the commas are outside of any object
//and in the case of the second type of CSV, I remove only double quotes ("")
function splitOuter(str, delimiter, csvType = globalCSVType){
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


//Custom function to strip all extra quotes that are not needed
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

//Sorts a list of tweet objects by time
function sortByTime(tweetObjects){
	for(var i = 1; i < tweetObjects.length; i++){
		var date1 = new Date(tweetObjects[i].localTime);
		var j = i;
		var date2;
		while(j > 0 && (date2 = new Date(tweetObjects[j-1].localTime))>date1){
			swap(tweetObjects, j, j-1);
			j--;
		}
		
	}
}


//Type 1, localTime format: Sun Jan 01 00:02:49 -0500 2017
//Type 2, localTime format: 10/29/2012  2:22:00 PM
//Compares two time strings in one of the formats above
//1 if time1 > time2
//0 if time1 = time2
//-1 if time1 < time2
function comparePostTimes(time1, time2){
	var date1 = new Date(time1);
	var date2 = new Date(time2);
	return ((date1>date2)?1:((date1<date2)?-1:0))
}


//Takes in dates in the format yyyy/mm/dd
// 1 if date1 > date2
// 0 if date1 == date2
// -1 if date1 < date2
function compareDates(date1, date2){
	var comps1 = date1.split("/");
	var comps2 = date2.split("/");
	for(var i = 0; i < 3; i++){
		if(parseInt(comps1[i]) > parseInt(comps2[i])){
			return 1;
		} else if (parseInt(comps1[i]) < parseInt(comps2[i])){
			return -1;
		}
	}
	return 0;
}

//Takes in dates as date objects
// 1 if date1 > date2
// 0 if date1 == date2
// -1 if date1 < date2
function compareDatesObjs(date1, date2){
	var date1Comps = [date1.getFullYear(), date1.getMonth(), date1.getDate()];
	var date2Comps = [date2.getFullYear(), date2.getMonth(), date2.getDate()];
	for(var i = 0; i < 3; i++){
		if(date1Comps[i] > date2Comps[i])
			return 1;
		else if(date1Comps[i] < date2Comps[i])
			return -1;
	}
	return 0;
}

//Takes in times in the 24h format hh:mm:ss
// 1 if time1 > time2
// 0 if time1 == time2
// -1 if time1 < time2
function compareTimes(time1, time2){
	var comps1 = time1.split(":");
	var comps2 = time2.split(":");
	for(var i = 0; i < 3; i++){
		if(parseInt(comps1[i]) > parseInt(comps2[i])){
			return 1;
		} else if (parseInt(comps1[i]) < parseInt(comps2[i])){
			return -1;
		}
	}
	return 0;
}


//Type 1, localTime format: Sun Jan 01 00:02:49 -0500 2017
//Type 2, localTime format: 10/29/2012  2:22:00 PM

//Function to retrieve the local time only (not including date or time zones (YET))
//Returns time in standardized 24h format, hh:mm:ss
function getTime(str){
	var date = new Date(str);
	return date.toTimeString().split(" ")[0];
}

 
//Type 1, localTime format: Sun Jan 01 00:02:49 -0500 2017
//Type 2, localTime format: 10/29/2012  2:22:00 PM
//Function to retrieve the local date only (not including the local time or time zone (YET))
//Returns date in standardized format yyyy/mm/dd
function getDate(str){
	var date = new Date(str);
	return date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate();
}

//Returns new Date object
function getDateObj(str){
	return new Date(str);
}

//Helper function for the sorting algorithm
function swap(arr, ind1, ind2){
	var temp = arr[ind1];
	arr[ind1] = arr[ind2];
	arr[ind2] = temp;
}

//PAGE ELEMENTS
//Pans the map to a new position (OBSELETE?)
function updateMap(map, newPos, newZoom){
	map.panTo(newPos, newZoom);
}
//This for drag/drop functionality
function handleFileSelect(event){
	event.stopPropagation();
	event.preventDefault();
	var file = event.dataTransfer.files[0];
	console.log(event.dataTransfer.files.length);
	console.log(document.getElementById("fileSelector").value);
	document.getElementById("fileSelector").innerHTML = file.name;

}
//This is also for drag/drop functionality
function handleDragOver(event){
	event.stopPropagation();
	event.preventDefault();
	event.dataTransfer.dropEffect = "copy";
}

function lerpColor(color1, color2, t){

}

//Need to deal with not only duplicates, but markers that are very close to each other, 
//as shown in the NYCsandy_during.csv. Not yet complete 
function addLocationMarkers(tweetObjects, geoJSONLayer){
	var numAtLocation = new Map();
	for(var i = 0; i < tweetObjects.length; i++){
		if(numAtLocation.has(tweetObjects[i].inferedPointStr)){
			numAtLocation.set(tweetObjects[i].inferedPointStr, numAtLocation.get(tweetObjects[i].inferedPointStr)+1);
		} else {
			numAtLocation.set(tweetObjects[i].inferedPointStr, 1);
		}
	}
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
//////Maybe connect the map to the chart so that hovered-over nodes will highlight markers on the map
function updateChartTimeInterval(tweets, timeInterval, csvType = globalCSVType){
	var dataPoints = [];
	
	var chart = new CanvasJS.Chart("lineGraph", {
		title: {text:"Tweets vs. Time"},
		axisY:{title:"Number of Tweets"},
		axisX:{title:"Time"},
		data:[{type:"line", dataPoints:dataPoints}]

		/*
		scales:     {
                xAxes: [{
                    type:       "time",
                    time:       {
                        format: "MM/DD/YYYY HH:MM:SS",
                        tooltipFormat: 'll'
                    }
                }]
            }*/
	});
	fillDataPointsTimeInterval(dataPoints, tweets, timeInterval, csvType);
	chart.render();
}

////NEED TO DEBUG
function fillDataPointsTimeInterval(dataPoints, tweets, timeInterval, csvType = globalCSVType){
	//Sorting is not currently needed because tweets are already sorted
	sortByTime(tweets);
	var minTime = tweets[0].localTime;
	var minDateObj = new Date(minTime);
	var maxTime = tweets[tweets.length-1].localTime;
	var maxDateObj = new Date(maxTime);
	var numIntervals = getTimeDifference(minDateObj, maxDateObj) / timeInterval;
	var currTime = 0;
	var currIndex = 0;
	for(var i = 0; i < numIntervals; i++){
		currTime += timeInterval;
		var numAtTime = 0;
		for(currIndex; currIndex < tweets.length; currIndex++){
			var timeDiff = getTimeDifference(new Date(tweets[currIndex].localTime), minDateObj);
			if(timeDiff <= currTime){
				numAtTime++;
			} else {
				break;
			}
		}
		var currDateObj = new Date(minDateObj.getTime() + (currTime-timeInterval) * 60000);
		dataPoints.push({x:currDateObj,y:numAtTime});
	}
}

function getTimeDifference(dateObj1, dateObj2){
	if(dateObj1>dateObj2){
		return (dateObj1.getTime()-dateObj2.getTime())/60000;
	} else if (dateObj1<dateObj2){
		return (dateObj2.getTime()-dateObj1.getTime())/60000;
	} else {
		return 0;
	}
}

//This code runs when the page is fully loaded and mainly deals with loading and handling the file,
//as well as showing the data on the map
window.onload = function(){
	var currentDate = new Date();
	document.getElementById("date2").value = (currentDate.getMonth()+1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear();

	//Map
	var map = L.map("map").setView([35,-95],3);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox.streets',
	    accessToken: 'pk.eyJ1IjoiamxoMjkiLCJhIjoiY2p1a3lncDdxMHI1MTQzbzR0NDN4bDdxciJ9.v5aYG6rQPqpJONdRVSiRZw'
	}).addTo(map);
	var layerGroup = L.layerGroup().addTo(map);
	var tweets = [];
	var shownTweets = [];

	//Drag and drop zone
	var dropZone = document.getElementById("dropZone");
	dropZone.addEventListener("dragover", handleDragOver, false);
	dropZone.addEventListener("drop", handleFileSelect, false);
	var lastFile = undefined;

	//AnalyzeButton
	document.getElementById("analyzeButton").addEventListener("click", function(){
		/////////////////Reading file and creating a tweetObject array///////////////// 
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
		if(inFile != lastFile || globalFilterDate1 != new Date(document.getElementById("date1").value) || globalFilterDate2 != new Date(document.getElementById("date2").value)){

			var filterDate1 = new Date(document.getElementById("date1").value);
			var filterDate2 = new Date(document.getElementById("date2").value);
			if(filterDate2 < filterDate1){
				alert("Incorrect date range");
				return;
			}
			globalFilterDate1 = filterDate1;
			globalFilterDate2 = filterDate2;



			//Clear all markers if any are present
			layerGroup.clearLayers();
			//Add a new tweet layer on the map that holds all of the markers
			var tweetLayer = L.geoJSON(null, {
				onEachFeature: function(feature, layer){
					//Popup contents:
					layer.bindPopup("<b>There " + ((feature.numAtLocation > 1)?"are ":"is ") + feature.numAtLocation + " Tweet" + ((feature.numAtLocation>1)?"s":"") + " from this location</b>");
				},
				pointToLayer: function(feature, latlng){
					////// Could add a gradient of colors depending on the number of tweets from that location
					return L.circleMarker(latlng, {
						weight: 1,
						fillOpacity: 0.8,
						opacity: 1,
						color: "#000",
						fillColor: "#0494CE",
						radius: 8
					});
				}

			}).addTo(layerGroup);


			//Create a file reader, and read it to csvText
			var reader = new FileReader();
			var csvText = "";
			//Code is executed when the reader is fully loaded and ready to operate on the file
			reader.onload = function(e) {
				csvText = reader.result;
				//Grab the selected type (or recognize if there is not a type specified)
				var radioButton = document.querySelector("input[name=\"csvTypeRadio\"]:checked");
				var csvType = (radioButton==null)?0:radioButton.value;
				//Create tweets array
				tweets = convertCSVToObjs(csvText, csvType);
				shownTweets = filterDateRange(tweets, filterDate1, filterDate2);
				
				//Add the markers to the map
				addLocationMarkers(shownTweets, tweetLayer);
				//Adjust the map to fit the markers
				map.fitBounds(tweetLayer.getBounds());

				var timeInterval = 0;
				try{
					timeInterval = parseInt(document.getElementById("timeInterval").value);
				} catch {
					alert("Incorrect number input");
				}
				updateChartTimeInterval(shownTweets, timeInterval, globalCSVType);
				
			};
			reader.readAsText(inFile);
			lastFile = inFile;
		} else {
			var timeInterval = 0;
			try{
				timeInterval = parseInt(document.getElementById("timeInterval").value);
			} catch {
				alert("Incorrect number input");
			}
			updateChartTimeInterval(tweets, timeInterval, globalCSVType);
		}
		
	});

};
