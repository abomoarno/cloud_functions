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

	var modulo = 3;

	if ((1 + Math.floor(Math.random() * 10001)) % modulo == 0) {

		const payload = {
		      	data:{
		      		titre : snap.val().titre,
        			message : "A new video added",
        			image : snap.val().image,
        			type : "video",
        			id : snap.val().id
		      	},
		      	topic:"dailynotif"
     		 };

		return admin.messaging().send(payload).catch((error) => {
			console.log('Error sending message:', error);
    	});
	}

});
