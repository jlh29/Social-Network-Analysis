import seaborn
#I'll be using seaborn as the main library for plotting the data
import json
import geojson
import csv


class tweet_object:
	def __init__(self, tweetJson, position, localTime, relavance):
		self.tweet = json.loads(tweetJson);
		self.position = Point(json.loads(position));
		self.localTime = localTime;
		self.relavance = relavance;

def read_csv(csvName, showMap, timeStep):
	tweetObjects = {};
	with open(csvName, newline='', encoding='utf-8') as csvFile:
		fileReader = csv.reader(csvFile, delimiter=' ')#, quotechar='|');
		x = 0
		for row in fileReader:

			print(x)
			x+=1
			#Reads all 100 rows + header so far
			

	return
	

def plot_from_data(tweetObjects, showMap, timeStep):
	return
	#for(i = 0; i < len(tweetObjects); i++)



read_csv('sample.csv', False, 5)