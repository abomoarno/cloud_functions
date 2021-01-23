const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.addReview = functions.https.onCall((data, context) => {

	const note = data.note;
	const recette = data.recette;

  var dbNote;
  var dbReviews;

	var newNote;

  var recette_node = admin.firestore().collection("recettes").doc(recette);

  return recette_node.get().then(function(doc){
    if (doc.exists) {
      var dbNote = doc.data().note + note;
      var dbReviews = doc.data().reviews;

      if (!dbReviews) {
        dbReviews = 1;
      }
      else
        dbReviews++;

      console.log("Document data:", doc.data());
      recette_node.update({
        reviews:dbReviews,
        note:dbNote
      });

       return { 
          reviews:dbReviews,
          note:dbNote
        };
    }
  });
  
});

exports.sendNotifs = functions.firestore.document("recettes/{recetteId}").onCreate((change,context)=>{

	var modulo = 5;

	if ((1 + Math.floor(Math.random() * 10001)) % modulo == 0) {

		const payload = {
		      	data:{
		      		type : "recette",
        			id : context.params.recetteId
		      	},
		      	topic:"niamoro_cuisine_notifications"
     		 };

		admin.messaging().send(payload).catch((error) => {
			console.log('Error sending message:', error);
    	});
	}

});

exports.dailyNotif = functions.https.onRequest((req, res) => {

  admin.firestore().collection("recettes").get().then(function(querySnapshot) {

  	var recettes = querySnapshot.docs;

	var recette = recettes[Math.floor(Math.random()*recettes.length)];  

	const payload = {
		      	data:{
		      		type : "recette",
        			id : recette.id
		      	},
		      	topic:"niamoro_cuisine_notifications"
     		 };

     		admin.messaging().send(payload).catch((error) => {
			console.log('Error sending message:', error);
    	}); 

	res.status(200).send("Ok");
});
});