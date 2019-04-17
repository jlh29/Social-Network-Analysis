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

//To be used in a simple browser-based visualization tool
function loadFile(pathName){
	if(window.File && window.FileReader && window.FileList && window.Blob){
		
	} else {
		alert("Possibile incompatibilities with file I/O");
	}
}