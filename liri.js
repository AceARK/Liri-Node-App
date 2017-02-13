var spotify = require('spotify');
var Twitter = require('twitter');
var request = require('request');
var fs = require("fs");
var moment = require("moment");
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
			if(query === "") {
				spotifySearch("the sign");
			}else {
				spotifySearch(query);
			}
			break;

		case "my-tweets":
			fetchMyTweets();
			break;

		case "movie-this":
			fetchMovieDetails(query);
			break;

		case "do-what-it-says":
			doWhatRandomFileSays();
			break;

		default: 
			console.log("Enter: 'node liri.js' + any of the following: 'spotify-this-song <songName>', 'my-tweets', 'movie-this <movieName>', or 'do-what-it-says'");
			break;
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
		 	var newArray = songDetailArray.filter(item => item.name.trim().toLowerCase() === (parameter.trim().toLowerCase()));
		 	
		 	// Printing out details to console
		 	console.log(`
------------------------------
Artist(s): ${newArray[0].name}
Song: ${newArray[0].artists[0].name}
Preview link: ${newArray[0].preview_url}
Album: ${newArray[0].album.name}
------------------------------`);
		 	// Logging data
		 	fs.appendFile("log.txt", `
------------------------------
${newArray[0].name}
${newArray[0].artists[0].name}
${newArray[0].preview_url}
${newArray[0].album.name}
------------------------------
`, function(error) {
				if(error) {
					console.log(error);
				}
			})
		});
}

// Function to fetch latest 20 tweets
function fetchMyTweets() {
	// params variable holds the screen_name of the user. Currently checking 'WatchingInAwe's' tweets
	var params = {screen_name: 'realDonaldTrump'};
	// API call to fetch tweets of given username
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			// Heading for tweets
			console.log(`
Here are your latest 20 tweets - 
===============================`);

			// Get and print tweets
			tweets.every(function(item, index) {
				// Cutting off latest tweets at 20
			    if (index < 20) {

			    	// Logging tweet and info
					fs.appendFile("log.txt", `
-----------------------
${moment(item.created_at).format('llll')}
${index + 1}. ${item.text} 
-----------------------
` , function(error) {
						if(error) {
							console.log(error);
						}
					});

					// Printing out timestamp and tweet to console
					console.log(
`${moment(item.created_at).format('llll')}
${index + 1}. ${item.text} 
===============================
`					);
			    	return true;
			    }
				
			});
		} 
	});
}

function fetchMovieDetails(movieName) {
	if(movieName === "") {
		// Printing out random text to console
		console.log(`
----------------------
If you haven't watched "Mr. Nobody", you should: http://www.imdb.com/title/tt0485947/
It's on Netflix!
----------------------
		`);

	}else {
		movieName = movieName.trim().split(" ").join("+");
		request('http://www.omdbapi.com/?t=' + movieName + '&tomatoes=true', function (error, response, body) {
			// If no error and statusCodes are either success 
			if (!error && (response.statusCode == 200)) {
				var data = JSON.parse(body);

				// Printing out data to console
				console.log(`
========================
Title: ${data.Title}
Released in: ${data.Year}
Rated: ${data.Rated}
Country: ${data.Country}
Language: ${data.Language}
Plot: ${data.Plot}
Actors: ${data.Actors}
Rotten Tomatoes Rating: ${data.tomatoRating}
Rotten Tomatoes URL: ${data.tomatoURL}
========================
				`);

			    // Log data
			    fs.appendFile("log.txt", `
-----------------------
${data.Title}
${data.Year}
${data.Rated}
${data.Country}
${data.Language}
${data.Actors} 
${data.Plot} 
${data.tomatoRating}
${data.tomatoURL}
-----------------------` , function(error) {
					if(error) {
						console.log(error);
					}
				});

			}else if(response.statusCode == 503) {
// Printing out service unavailable error to console, since that seems to be a common response from OMDB
				console.log(`
------------------------
Service Unavailable
HTTP Error 503. The service is unavailable.
------------------------`);

			}else if(response.statusCode == 400) {
				console.log("Bad request.");
			}else if(response.statusCode == 502) {
				console.log("Bad gateway.");
			}else if(response.statusCode == 401) {
				console.log("Unauthorized.");
			}else {
				console.log("Error line: " + error);
			}
		})
	}
}

// Function to do whatever is written in random.txt file
function doWhatRandomFileSays() {
	// Reading random.txt 
	fs.readFile("random.txt", "utf-8", function(error, data) {
		var dataArray = data.split(',');
		// Removing quotes at the end of string as specified in instruction format
		var nameOfSong = dataArray[1].substring(1,dataArray[1].length-1);
		// Sending the command and parameter to map function
		performFunctionIfCommandIs(dataArray[0], nameOfSong);
	});
}

function logData(command, parameter) {
	// Logging timestamp, command and query term to log.txt
	fs.appendFile("log.txt", `
----------------------------
${moment().format("llll")}
${command}
${parameter}
----------------------------
`, function(error) {
		if(error) {
			console.log(error);
		}
	});
}