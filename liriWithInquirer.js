var inquirer = require('inquirer');
var spotify = require('spotify');
var Twitter = require('twitter');
var request = require('request');
var movieRequire = require("./keys.js");
var movieDB = require('moviedb')(movieRequire.movieDBKey.key);
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

		case "Twitter":
			inquirer.prompt([
				{
					type: 'confirm',
					message: 'Would you like to provide your userName?',
					name: 'name' 
				}
			]).then(function(user) {
				if(user.name) {
					inquirer.prompt([
						{
							message: 'Enter your twitter username: ',
							name: 'userName' 
						}
					]).then(function(twitter) {
						fetchMyTweets(twitter.userName);
						logData(twitter.userName);
					})
				}else {
					console.log("Alright then, here's a bunch of tweets from Donald Trump for your entertainment.");
					fetchMyTweets("");
					logData('realDonaldTrump');
				}
			})
			break;

		case "Movie DB":
			inquirer.prompt([
				{
					type: 'confirm',
					message: 'Would you like to enter a movie name?',
					name: 'enterName' 
				}
			]).then(function(choice) {
				if(choice.enterName) {
					inquirer.prompt([
						{
							message: 'Enter the movie name:',
							name: 'name' 
						}
					]).then(function(movie) {
						movieSearch(movie.name);
						logData(movie.name);
					})
				}else {
					// Printing out random text to console
					console.log(`
----------------------
If you haven't watched "Mr. Nobody", you should: http://www.imdb.com/title/tt0485947/
It's on Netflix!
----------------------
					`);
					logData('Mr.Nobody');
					doAnother();
				}
			});
			break;

		case "Do something random":
			doWhatRandomFileSays();
			break;

		default: 
			console.log("Hello!");
			break;
	}
}

function movieSearch(query) {
	var movieName = query.trim().toLowerCase();
	movieDB.searchMovie({query: movieName}, function(err, res){
	  	var data = res.results[0];
		// Printing out data to console
				console.log(`
========================
Title: ${data.title}
Release date: ${data.release_date}
Language: ${data.original_language}
Plot: ${data.overview}
Popularity: ${data.popularity}
Average vote rating: ${data.vote_average}
========================
				`);

			    // Log data
			    fs.appendFile("logInquirer.txt", `
-----------------------
${data.title}
${data.release_date}
${data.original_language}
${data.overview}
${data.popularity}
${data.vote_average} 
-----------------------` , function(error) {
					if(error) {
						console.log(error);
					}
				});
		doAnother();

	});
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
Song: ${newArray[0].name}
Artist(s): ${newArray[0].artists[0].name}
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
			doAnother();
	});
}


// Function to fetch latest 20 tweets
function fetchMyTweets(parameter) {
	if(parameter !== "") {
		var params = {screen_name: parameter};
	}else {
		// params variable holds the screen_name of the user. 
		var params = {screen_name: 'realDonaldTrump'};
	}

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
					fs.appendFile("logInquirer.txt", `
-----------------------
${moment(item.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('llll')}
${index + 1}. ${item.text} 
-----------------------
` , function(error) {
						if(error) {
							console.log(error);
						}
					});

					// Printing out timestamp and tweet to console
					console.log(
`${moment(item.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('llll')}
${index + 1}. ${item.text} 
===============================
`					);
			    	return true;
			    }
				
			});
		} 
		doAnother();
	});
}

// Function to do whatever is written in random.txt file
function doWhatRandomFileSays() {
	// Reading random.txt 
	fs.readFile("random.txt", "utf-8", function(error, data) {
		var dataArray = data.split(',');
		// Removing quotes at the end of string as specified in instruction format
		var searchTerm = dataArray[1].substring(1,dataArray[1].length-1);
		if(dataArray[0].includes('spotify')) {
			spotifySearch(searchTerm);
		}else if(dataArray[0].includes('tweets')){
			fetchMyTweets("");
		}else if(dataArray[0].includes('movie')) {
			fetchMovieDetails(searchTerm);
		}
		logData(searchTerm);
	});
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