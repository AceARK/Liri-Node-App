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
	spotify.search({ type: 'track', query: parameter}, function(err, data) {
		    if ( err ) {
		        console.log('Error occurred: ' + err);
		        return;
		    }
		 	var songDetailArray = data.tracks.items;

		 	var newArray = songDetailArray.filter(item => item.name.trim().toLowerCase() === (parameter.trim()));
		 	
		 	console.log("Artist(s): " + newArray[0].name);
		 	console.log("Song: " + newArray[0].artists[0].name);
		 	console.log("Preview link: " + newArray[0].preview_url);
		 	console.log("Album: " + newArray[0].album.name);
		});
}

// Function to fetch latest 20 tweets
function fetchMyTweets() {
	// params variable holds the screen_name of the user. Currently checking 'WatchingInAwe's' tweets
	var params = {screen_name: 'WatchingInAwe'};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			console.log("Here are your latest 20 tweets - ");
			console.log("===============================");
			// Get and print tweets
			tweets.every(function(item, index) {
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
	fs.readFile("random.txt", "utf-8", function(error, data) {
		var dataArray = data.split(",");
		performFunctionIfCommandIs(dataArray[0], dataArray[1]);
		// console.log(data);
	});
}