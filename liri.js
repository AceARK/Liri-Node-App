var twitterRequire = require("./keys.js");

// Storing twitter keys in A variable
var twitterDetails = {
	twitter_consumer_key : twitterRequire.twitterKeys.consumer_key,
	twitter_consumer_secret : twitterRequire.twitterKeys.consumer_secret,
	twitter_access_token_key : twitterRequire.twitterKeys.access_token_key,
	twitter_access_token_secret : twitterRequire.twitterKeys.access_token_secret
}

var command = process.argv[2];
var parameter = "";
var spotify = require('spotify');

for(var i = 3; i < process.argv.length; i++) {
	parameter += process.argv[i] + " ";
}

switch(command) {
	case "spotify-this-song":
		spotify.search({ type: 'track', query: parameter}, function(err, data) {
		    if ( err ) {
		        console.log('Error occurred: ' + err);
		        return;
		    }
		 	var songDetailArray = data.tracks.items;
		 	// console.log(songDetailArray);
		 	songDetailArray.forEach(function(item) {
		 		console.log(item.artists[0].name);
		 	});
		 	// console.log(songDetailArray);
		    // console.log("Artist name: " + JSON.stringify(data.tracks.items[0].artists[0].name, null, 2));
		});
}