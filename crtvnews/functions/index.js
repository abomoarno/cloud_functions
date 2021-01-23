const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.cleanDb = functions.https.onRequest((req, res) => {
  admin.database().ref("videos").once("value").then(function(snapshot){
		//console.log(new Date());
		var cpt = 0;
		snapshot.forEach(function(childSnapshot){
			var time = ((new Date()).getTime() - (new Date(childSnapshot.val().date)).getTime())/1000;
			if(time>604800)
				admin.database().ref("videos/" + childSnapshot.key).remove();
		});

		res.status(200).send("Ok");
	});
});

exports.addVideos = functions.https.onRequest((req,res) => {

	var json = JSON.parse(req.body);

	for(video in json){

		admin.database().ref("videos").child(video).set(json[video]);

	}	

	res.status(200).send("Ok");
});

exports.updateLinks = functions.https.onRequest((req,res)=>{

	var json = JSON.parse(req.body);
	for(link in json){
		admin.database().ref("liveTvs").child(link).child("lien").set(json[link]);
	}

	res.status(200).send("Ok");

});

exports.sendNotifs = functions.database.ref("videos/{videoId}").onCreate((snap,context)=>{

	const channel = snap.val().channel;

	var modulo = 5;

	switch(channel){
		case "crtv":
		case "equinox":
		case "canal2":
		case "stv":
		case "vision4":
			modulo = 3;
			break;
		case "africanews":
		case "africa24":
		case "afriquemedia":
			modulo = 4;
			break;
	}

	if ((1 + Math.floor(Math.random() * 10001)) % modulo == 0) {

		const payload = {
		      	data:{
		      		titre : snap.val().titre,
        			message : "Nouvelle vidéo ajoutée",
        			image : snap.val().image,
        			type : "video",
        			id : snap.val().id
		      	},
		      	topic:"appnotif"
     		 };

		admin.messaging().send(payload).catch((error) => {
			console.log('Error sending message:', error);
    	});
	}

});

exports.sendNotifsCmtd = functions.https.onRequest((req,res)=>{

	var json = JSON.parse(req.body);

	console.log('message:', json);

	const payload = {
	      	data:{
	      		title : json["title"],
    			description : json["description"],
    			illustration : json["illustration"],
    			type_notif : json["type_notif"],
    			popup_text : json["popup_text"],
    			notif_id : json["notif_id"],
    			id : json["id"]
	      	},
	      	topic:"camertoday_notifs"
 		 };

	admin.messaging().send(payload).catch((error) => {
		console.log('Error sending message:', error);
	});

	res.status(200).send("Ok");
});
