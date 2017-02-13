var restify = require('restify');
var builder = require('botbuilder');
var lodash  = require('lodash');

//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
server.listen(3000, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create chat bot
var connector = new builder.ChatConnector({
	appId : "86dfb2c7-fcc1-47f3-a5b3-0d28421e9b4c",
	appPassword : "OWPdaWzk9paOcnRB19kKq1d"
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
//Bot on
bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
            .address(message.address)
            .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});
bot.on('typing', function (message) {
    // User is typing
});
bot.on('deleteUserData', function (message) {
    // User asked to delete their data
});
//=========================================================
// Bots Dialogs
//=========================================================
String.prototype.contains = function(content){
    return this.indexOf(content) !== -1;
};


bot.dialog('/', [
    function (session, args, next) {
       session.beginDialog('/name');
    },
    function (session, results) {
       session.beginDialog('/age');
    },
    function (session, results) {
       session.beginDialog('/gender');
    },
    function (session, results) {
        session.beginDialog('/symptoms');
    },
    function (session, results) {
        session.beginDialog('/region');
    },
    function (session, results) {
        session.beginDialog('/symptomsChecker');
    },
    function (session, results) {
        session.beginDialog('/recommendation');
    }, 
    function (session, results) {
        session.send(session.userData.name + ', your age is ' + session.userData.age
         + ' and your gender is ' + session.userData.gender);
    }

]);

bot.dialog('/name', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

bot.dialog('/age', [
    function (session) {
        builder.Prompts.text(session, 'What is your age?');
    },
    function (session, results) {
        session.userData.age = results.response;
        session.endDialog();
    }
]);

bot.dialog('/gender', [
    function (session) {
        builder.Prompts.text(session, 'What is your gender (M|F)?');
    },
    function (session, results) {
        session.userData.gender = results.response;
        session.endDialog();
    }
]);

bot.dialog('/symptoms', [
    function (session) {
        builder.Prompts.text(session, 'What are your symptoms?');
    },
    function (session, results) {
        session.userData.symptoms = results.response;
        session.endDialog();
    }
]);
bot.dialog('/region', [
    function (session) {
        builder.Prompts.text(session, 'What is your region?');
    },
    function (session, results) {
        session.userData.region = results.response;
        session.endDialog();
    }
]);

var symptomDB = {
    'cough,fever': 'flu',
    'right shoulder pain, chest pain, heavy chest': 'heart attack',
    'regurgitation, dyspepsia, heartburn': 'acidReflux',
    'burping, nausea, stomachfullness, bloating': 'dyspepsia',
    'decreasedmotivation, disorganization, fidgeting, forgetfulness, frequenttalking, hyperactivity, hyperfocus, impulsivity, inattention, insomnia, intrusiveness, moodswings, restlessness, procrastination':'attention deficit hyperactivity disorder',	
    'nasalcongestion, itchyeyes, wateryeyes, sneezing, stuffynose, runnynose, scratchythroat, sorethroat, throatcleaning, cough': 'allergy',
    'confusion, lossofalertness, lossoforientation, defectsinjudgement, defectsinthought, unusalbehavior, strangebehavior, poorregulationofemotions, disruptionsinperception, psychomotorskills, psychomotorbehavior': 'altered mental status',	
    'anger, apathy, behaviorchanges, confusion, decreasedability, erraticbehavior, languageproblems, lossofbladdercontrol, lossofbowelcontrol, memoryloss, moodchanges, poorhygiene, poorjudgement, quarrelsomeness': 'alzheimer disease',	
    'insuffiicientcleaning, ingestingspicyfoods, diarrhea, analtear, fungalinfection, hemorrhoids, pinworms, abrasion, analleakage': 'anal itching'	,
    'hives, difficultybreathing, feelingofimpendingdoom, reducedbloodpressure': 'anaphylaxis',	
    'easyfatigue, lossofenergy, rapidheartbeat, shortnessofbreath, headache, difficultyconcentrating, dizziness, paleskin, legcramps, insomnia': 'anemia',
    'abdomenpain, appetiteloss, nausea, vomiting, abdominalswelling, temperature, constipation, diarrheawithgas': 'appendicitis',	
    'facialpain, stuffedupnose, lossofsmell, cough, congestion, fever, badbreath, fatigue, dentalpain':	'acute sinusitis'
  };

bot.dialog('/symptomsChecker', [
    function (session) {
        var symptoms = session.userData.symptoms;
        var cleanedSymptomsFromPatient = symptoms.replace(/\s/g, '').toLowerCase();
        var diseaseFound = false;
        var diseaseDiagnosed = 'NA';

        lodash.each(symptomDB, function (diseaseName, symptomNames) {
            if (!diseaseFound)  {
                var cleanedSymptomKey = symptomNames.replace(/\s/g, '').toLowerCase();

                if (lodash.includes(cleanedSymptomKey, cleanedSymptomsFromPatient)) {
                    diseaseFound = true;
                    diseaseDiagnosed = diseaseName;
                }
            }
        });
        session.userData.diagnosedDiseaseName = diseaseDiagnosed;
        session.send("Diagnosed Disease : " + diseaseDiagnosed);
        session.endDialog();
    }
]);
var recommendationDB = {
		'flu': 'crocin',
		'allergy': 'allegra'
};

bot.dialog('/recommendation', [
                                function (session) {
                                    var disease = session.userData.diseaseDiagnosed;
                                    var recommendationFound = false;
                                    var recommendationGiven = 'NA';

                                    
      lodash.each(recommendationDB, function (diseaseName, recommendationName) {
                                
         if (lodash.includes(diseaseName, diseaseDiagnosed)) {
                                                recommendationFound = true;
                                                recommendationGiven = recommendationName;
                                            }
                                        
                                    });
                                    session.userData.recommendationGivenName = recommendationGiven;
                                    session.send("recommendation Given : " + recommendationGiven);
                                    session.endDialog();
                                }
                            ]);
                  