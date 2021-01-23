const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.addVideos = functions.https.onRequest((req,res) => {

	var json = JSON.parse(req.body);

	for(video in json){

		admin.database().ref("videos").child(video).set(json[video]);

	}	

	res.status(200).send("Ok");
});

// CETTE FONCTION PERMET DE REINITIALISER LE NOMBRE DE VUES POUR CHAQUE JOUR

exports.dailyClean = functions.https.onRequest((req,res) => {

	admin.database().ref("videos").once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			const dayVues = childSnapshot.val().today_views;
			const weekVues = childSnapshot.val().week_views;
			const month_views = childSnapshot.val().month_views;
			admin.database().ref("videos/" + childSnapshot.key).child("week_views").set(dayVues+weekVues);
			admin.database().ref("videos/" + childSnapshot.key).child("month_views").set(dayVues+month_views);
			admin.database().ref("videos/" + childSnapshot.key).child("today_views").set(0);
		});

		res.status(200).send("Ok");
	});
});

// CETTE FONCTION PERMET DE REINITIALISER LE NOMBRE DE VUES POUR CHAQUE SEMAINE

exports.weeklyClean = functions.https.onRequest((req,res) => {

	admin.database().ref("videos").once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			admin.database().ref("videos/" + childSnapshot.key).child("week_views").set(0);
		});

		res.status(200).send("Ok");
	});
});

// CETTE FONCTION PERMET DE REINITIALISER LE NOMBRE DE VUES POUR CHAQUE MOIS

exports.monthlyClean = functions.https.onRequest((req,res) => {

	admin.database().ref("videos").once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			admin.database().ref("videos/" + childSnapshot.key).child("month_views").set(0);
		});

		res.status(200).send("Ok");
	});
});

exports.sendNotifs = functions.database.ref("videos/{videoId}").onCreate((snap,context)=>{

	var sujet = "niamoro_comedy_" + snap.val().comedien; // Le topic de la notification
	const payload = {
	      	data:{
	      		titre : snap.val().titre,
    			message : "Nouvelle vidéo comédie ajoutée ! soyez l'un des premiers à la voir !",
    			id : snap.key
	      	},
	      	topic:sujet
 		 };

	return admin.messaging().send(payload).catch((error) => {
		console.log('Error sending message:', error);
	});

});