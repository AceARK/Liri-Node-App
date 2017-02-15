var inquirer = require('inquirer');
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

// var command = process.argv[2];
// var parameter = "";

// // Getting anything typed after command as parameter
// for(var i = 3; i < process.argv.length; i++) {
// 	parameter += process.argv[i] + " ";
// }

inquire();

function inquire() {
	inquirer.prompt([
		{
			type: 'list',
			name: 'choice',
			message: 'What service would you like to avail?',
			choices: ["Twitter", "Spotify", "Movie DB", "Do something random"] 
		}
	]).then(function(user){

		// Begin operation
		performFunctionIfCommandIs(user.choice);
		// Write to log.txt file
		logData(user.choice);
	})
}

// Function to map each command to it's corresponding function
function performFunctionIfCommandIs(inputCommand) {
	switch(inputCommand) {
		case "Spotify":
			inquirer.prompt([
				{	
					type: 'list',
					name: 'query',
					message: 'Would you like to enter a song?',
					choices: ['Yes', 'No, I\'m too lazy']
				}
			]).then(function(spotify) {
				if(spotify.query !== 'Yes') {
					spotifySearch("the sign");
				}else {
					inquirer.prompt([
						{
							message: 'Enter the name of the song you want to spotify',
							name: 'name' 
						}
					]).then(function(song) {
						spotifySearch(song.name);
					})
				}
			})
			break;

		case "my-tweets":
			fetchMyTweets(parameter);
			break;

		case "movie-this":
			fetchMovieDetails(query);
			break;

		case "do-what-it-says":
			doWhatRandomFileSays();
			break;

		default: 
			console.log("Hello!");
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
		 	fs.appendFile("logInquirer.txt", `
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
	doAnother();
}

// Ask user if they want to continue with another action
function doAnother() {
	inquirer.prompt([
		{
			type: 'confirm',
			message: 'Would you like to do something else?',
			name: 'doSomethingElse'
		}
	]).then(function(user) {
		if(user.doSomethingElse) {
			inquire();
		}else {
			return;
		}
	})
}

// Function to log data
function logData(command) {
	// Logging timestamp, command and query term to log.txt
	fs.appendFile("logInquirer.txt", `
----------------------------
${moment().format("llll")}
${command}
----------------------------
`, function(error) {
		if(error) {
			console.log(error);
		}
	});
}