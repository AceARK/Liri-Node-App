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
		 	// Printing out details

		 	console.log(`
------------------------------

Artist(s): ${newArray[0].name}
Song: ${newArray[0].artists[0].name}
Preview link: ${newArray[0].preview_url}
Album: ${newArray[0].album.name}

------------------------------`);
		 	// Logging data
		 	fs.appendFile("log.txt", "\n" + newArray[0].name +"\n"+newArray[0].artists[0].name+"\n"+ newArray[0].preview_url+"\n"+ newArray[0].album.name, function(error) {
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
			console.log("Here are your latest 20 tweets - ");
			console.log("===============================");
			// Get and print tweets
			tweets.every(function(item, index) {
				// Cutting off latest tweets at 20
			    if (index < 20) {
			    	// Logging tweet and info
					fs.appendFile("log.txt", "\n" + "-----------------------" + "\n" + moment(item.created_at).format('llll') + "\n" + item.text + "\n" + "-----------------------" , function(error) {
						if(error) {
							console.log(error);
						}
					})
				    console.log(" ");
					console.log(moment(item.created_at).format('llll'));
					console.log(" ");
					console.log(item.text);
					console.log(" ");
					console.log("===============================");
			    	return true;
			    }
				
			});
		} 
	});
}

function fetchMovieDetails(movieName) {
	if(movieName === "") {
		console.log("----------------------");
		console.log('If you haven\'t watched "Mr. Nobody," then you should: http://www.imdb.com/title/tt0485947/');
		console.log("It's on Netflix!");
		console.log("----------------------");
	}else {
		movieName = movieName.trim().split(" ").join("+");
		request('http://www.omdbapi.com/?t=' + movieName + '&tomatoes=true', function (error, response, body) {
			// If no error and statusCodes are either success 
			if (!error && (response.statusCode == 200)) {
				var data = JSON.parse(body);
				console.log("========================");
			    console.log("Title: " + data.Title);
			    console.log("Released in: " + data.Year);
			    console.log("Rated: " + data.Rated);
			    console.log("Country: " + data.Country);
			    console.log("Language: " + data.Language);
			    console.log("Plot: " + data.Plot);
			    console.log("Actors: " + data.Actors);
			    console.log("Rotten Tomatoes Rating: " + data.tomatoRating);
			    console.log("Rotten Tomatoes URL: " + data.tomatoURL);
			    // Log data
			    fs.appendFile("log.txt", "\n" + "-----------------------" + "\n" + data.Title + "\n" + data.Year + "\n"+ data.Rated + "\n" + data.Country + "\n" + data.Language + "\n" + data.Actors + "\n"+ data.Plot + "\n" + data.tomatoRating + "\n" + data.tomatoURL + "\n" + "-----------------------" , function(error) {
					if(error) {
						console.log(error);
					}
				})
			    console.log("========================");
			}else if(response.statusCode == 503) {
				console.log("------------------------");
				console.log("Service Unavailable");
				console.log("------------------------");
				console.log("HTTP Error 503. The service is unavailable.");
				console.log("------------------------");
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
		console.log("Data array: " + dataArray);
		var nameOfSong = dataArray[1].substring(1,dataArray[1].length-1);
		console.log("Song name: " + nameOfSong);
		// Sending the command and parameter to map function
		performFunctionIfCommandIs(dataArray[0], nameOfSong);
	});
}

function logData(command, parameter) {
	fs.appendFile("log.txt", "\n"+ "----------------------------" + "\n" + moment().format("llll") + "\n" + command + " " + parameter + "\n" + "----------------------------", function(error) {
		if(error) {
			console.log(error);
		}
	});
}