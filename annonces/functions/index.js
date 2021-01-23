const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.createAnnonceCm = functions.firestore
    .document('cm/{cmId}')
    .onCreate((snap, context) => {

      const randomValue = 31 + Math.floor(Math.random() * 322);
      if ((randomValue % 4) != 0) {
        return;
      }
      
      const newValue = snap.data();

      var topic = newValue.pays + newValue.ville + newValue.typeBien + newValue.typeOperation;
      topic = topic.replace(/à|â/g,"a").replace(/é|è|ê/g,"e").replace(/î|ï/g,"i").replace("ô","o").replace(/ù|û|ü/g,"u");
      const payload = {
		      	data:newValue,
		      	topic:topic
      }


     admin.messaging().send(payload).catch((error) => {
    	console.log('Error sending message:', error);
    });
 });

exports.getAnnonces = functions.https.onRequest((req, res) => {

    var query = req.body;
    var json = JSON.parse(query);

    for(annonce in json){
    	admin.firestore().collection("cm").doc(annonce).set(json[annonce]);
    }

    res.status(200).send("Ok");
  
});

exports.cleanDb = functions.https.onRequest((req, res) => {
  admin.firestore().collection("cm").once("value").then(function(snapshot){
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