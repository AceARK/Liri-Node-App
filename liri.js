var spotify = require('spotify');
var Twitter = require('twitter');
var fs = require("fs");
var twitterRequire = require("./keys.js");

// Storing twitter keys in A variable
var twitterDetails = {
	consumer_key : twitterRequire.twitterKeys.consumer_key,
	consumer_secret : twitterRequire.twitterKeys.consumer_secret,
	access_token_key : twitterRequire.twitterKeys.access_token_key,
	access_token_secret : twitterRequire.twitterKeys.access_token_secret
}

var client = new Twitter(twitterDetails);

var command = process.argv[2];
var parameter = "";

// Getting anything typed after command as parameter
for(var i = 3; i < process.argv.length; i++) {
	parameter += process.argv[i] + " ";
}

// Begin operation
performFunctionIfCommandIs(command, parameter);
// Write to log.txt file
logData(command, parameter);

/* 
 * Function Definitions begin
*/

// Function to map each command to it's corresponding function
function performFunctionIfCommandIs(inputCommand, query) {
	switch(inputCommand) {
		case "spotify-this-song":
			if(parameter === "") {
				spotifySearch("the sign");
			}else {
				spotifySearch(query);
			}
			break;

		case "my-tweets":
			fetchMyTweets();
			break;

		case "movie-this":
			fetchMovieDetails();
			break;

		case "do-what-it-says":
			doWhatRandomFileSays();
	}
}

// Function to perform a spotify search of song entered by user
function spotifySearch(parameter) {
	// Spotify API call with user-specified song name as parameter
	spotify.search({ type: 'track', query: parameter}, function(err, data) {
		    if ( err ) {
		        console.log('Error occurred: ' + err);
		        return;
		    }
		    // Storing required data in array
		 	var songDetailArray = data.tracks.items;
		 	// Filtered array having just the data with song name specified
		 	// This is done due to the inconsistent and disparaging data provided by this package
		 	var newArray = songDetailArray.filter(item => item.name.trim().toLowerCase() === (parameter.trim()));
		 	// Printing out details
		 	console.log("------------------------------");
		 	console.log(" ");
		 	console.log("Artist(s): " + newArray[0].name);
		 	console.log("Song: " + newArray[0].artists[0].name);
		 	console.log("Preview link: " + newArray[0].preview_url);
		 	console.log("Album: " + newArray[0].album.name);
		 	// Logging data
		 	fs.appendFile("log.txt", "\n"+newArray[0].name +"\n"+newArray[0].artists[0].name+"\n"+ newArray[0].preview_url+"\n"+ newArray[0].album.name, function(error) {
				if(error) {
					console.log(error);
				}
			})
		 	console.log(" ");
		 	console.log("------------------------------");
		});
}

// Function to fetch latest 20 tweets
function fetchMyTweets() {
	// params variable holds the screen_name of the user. Currently checking 'WatchingInAwe's' tweets
	var params = {screen_name: 'WatchingInAwe'};
	// API call to fetch tweets of given username
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			console.log("Here are your latest 20 tweets - ");
			console.log("===============================");
			// Get and print tweets
			tweets.every(function(item, index) {
				// Logging tweet and info
				fs.appendFile("log.txt", "\n" + "-----------------------" + "\n" + item.created_at + "\n" + item.text + "\n" + "-----------------------" , function(error) {
					if(error) {
						console.log(error);
					}
				})
			    console.log(" ");
				console.log(item.created_at);
				console.log(" ");
				console.log(item.text);
				console.log(" ");
				console.log("===============================");
				// Cutting off latest tweets at 20
			    if (index >= 20)
			        return false;
			    else return true;
			});
		} 
	});
}

function fetchMovieDetails() {

}

// Function to do whatever is written in random.txt file
function doWhatRandomFileSays() {
	// Reading random.txt 
	fs.readFile("random.txt", "utf-8", function(error, data) {
		var dataArray = data.split(",");
		// Sending the command and parameter to map function
		performFunctionIfCommandIs(dataArray[0], dataArray[1]);
		// console.log(data);
	});
}

function logData(command, parameter) {
	fs.appendFile("log.txt", "\n"+ "----------------------------" + "\n" + command + " " + parameter + "\n" + "----------------------------", function(error) {
		if(error) {
			console.log(error);
		}
	});
}