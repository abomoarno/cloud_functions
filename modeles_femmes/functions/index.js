const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotifs = functions.https.onRequest((req,res)=>{

	var json = JSON.parse(req.body);

	console.log('message:', json);

	const payload = {
	      	data:{
	      		title : json["title"],
    			description : json["description"],
    			illustration : json["illustration"],
    			popup_text : json["popup_text"],
	      	},
	      	topic:"modeles_femmes_notifs"
 		 };

	admin.messaging().send(payload).catch((error) => {
		console.log('Error sending message:', error);
	});

	res.status(200).send("Ok");
});

exports.sendNotifsCoiffures = functions.https.onRequest((req,res)=>{

	var json = JSON.parse(req.body);

	console.log('message:', json);

	const payload = {
	      	data:{
	      		title : json["title"],
    			description : json["description"],
    			illustration : json["illustration"],
    			popup_text : json["popup_text"],
	      	},
	      	topic:"coiffures_femmes_notifs"
 		 };

	admin.messaging().send(payload).catch((error) => {
		console.log('Error sending message:', error);
	});

	res.status(200).send("Ok");
});