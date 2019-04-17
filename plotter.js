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
		currObj["label"] = currObj[0];
		currObj["tweet_object"] = JSON.parse(currObj[1]);
		currObj["infered_point"] = JSON.parse(currObj[2]);
		currObj["local_time"] = currObj[3];
		extractedObjects.push(currObj);
	}
	return extractedObjects;
}

function getTime(csvObject){
	console.log(csvObject["local_time"]);
	var comps = csvObject["local_time"].split(" ");
	var localTime = comps[3];
	return localTime;
}

function getDate(csvObject){
	var comps = csvObject["local_time"].split(" ");
	return comps[1] + " " + comps[2] + " " + comps[5];
}

function getLocation(csvObject){
	
}

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