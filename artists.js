var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var request = require('request');

var numOfArgs = process.argv.length;
var artists = [];
var songs = [];
var arr = [];
var indicies = [];
var theSubject = "Your artist(s) are: ";
var theMessage = "";
var theHTML = "";

console.log(numOfArgs);

if(numOfArgs > 2){
	for(i = 2; i < numOfArgs.length; i++){
		artists[i] = numOfArgs[i];
	}
}



request('https://www.billboard.com/charts/rap-song', function(error, response, html){
	if(!error && response.statusCode == 200){
		console.log(html);
	}

	var $ = cheerio.load(html);

	$('div.chart-row__title').each(function(i,element) {
		console.log($(this).text());
	});

	$('.chart-row__artist').each(function(i,element) {
		artists[i] = $(this).text().trim();
	});

	$('.chart-row__song').each(function(i, element) {
		songs[i] = $(this).text().trim();
	});

	console.log(artists);
	console.log(songs);

	if(process.argv.length == 2){
		console.log('You did not specify an artist(s)');
	}else{

		for(var i = 2; i < numOfArgs; i++){
			for(var j = 0; j < artists.length; j++){

				arr = artists[j].split(' ');

				for(var k = 0; k < arr.length; k++){

					if(process.argv[i] == arr[k]){

						indicies.push(j);

					}
				}
			}
		}
	}

	console.log(indicies);



		if ( indicies.length != 0 ){

			for (var i = 2; i < numOfArgs; i++){

				if(i == numOfArgs-1){
					theSubject = theSubject.concat(process.argv[i]);
				}else if(i == numOfArgs-2 && numOfArgs >= 5){
					theSubject = theSubject.concat(process.argv[i]);
					theSubject = theSubject.concat(", and ");
				}else if(i == numOfArgs-2 && numOfArgs == 4){
					theSubject = theSubject.concat(process.argv[i]);
					theSubject = theSubject.concat(" and ");
				}else{
					theSubject = theSubject.concat(process.argv[i]);
					theSubject = theSubject.concat(", ");
				}

			}

			for(var i = 0; i < indicies.length; i++){
				var x = indicies[i];
				theMessage = theMessage.concat(artists[x]);
				theMessage = theMessage.concat(": ");
				theMessage = theMessage.concat(songs[x]);
				theMessage = theMessage.concat("\n");

				theHTML = theHTML.concat("<div><b>");
				theHTML = theHTML.concat(artists[x])
				theHTML = theHTML.concat(": <b><i>");
				theHTML = theHTML.concat(songs[x]);
				theHTML = theHTML.concat("<i><div>");
			}

		}

		nodemailer.createTestAccount((err, account) => {

			let transporter = nodemailer.createTransport({
				host: 'smtp.ethereal.email',
				port: 587,
				secure: false,
				auth: {
					user: account.user,
					pass: account.pass
				}
			});

			let mailOptions = {
				from: '"Jeff Henrichs" <foo@example.com>', //sender address
				to: 'bar@example.com',
				subject: theSubject,
				text: theMessage,
				html: theHTML
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error);
				}
				console.log('Message sent: %s', info.messageId);

				console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
			});
		});


});
