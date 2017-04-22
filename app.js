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
    appId: "86dfb2c7-fcc1-47f3-a5b3-0d28421e9b4c",
    appPassword: "OWPdaWzk9paOcnRB19kKq1d"
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
        if (session.message && !session.message.text.match(/hello/i)) {
           return session.beginDialog('/recommendation');
        } else {
            next();
        }
    },
    function (session, args, next) {
      if (session.message && session.message.text.match(/hello/i)) {
          next();
      }
    },
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
        session.beginDialog('/symptomsChecker');
    },
    function (session, results) {
        session.beginDialog('/multipleDiseases');
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

var symptomDB = {
		'cough,fever': 'Flu',
	    'right shoulder pain, chest pain, heavy chest': 'Heart attack',
	    'regurgitation, dyspepsia, heartburn': 'Acid Reflux',
	    'burping, nausea, stomachfullness, bloating': 'dyspepsia',
	    'decreasedmotivation, disorganization, fidgeting, forgetfulness, frequenttalking, hyperactivity, hyperfocus, impulsivity, inattention, insomnia, intrusiveness, moodswings, restlessness, procrastination':'Attention deficit hyperactivity disorder',	
	    'nasalcongestion, itchyeyes, wateryeyes, sneezing, stuffynose, runnynose, scratchythroat, sorethroat, throatcleaning, cough': 'Allergy',
	    'confusion, lossofalertness, lossoforientation, defectsinjudgement, defectsinthought, unusalbehavior, strangebehavior, poorregulationofemotions, disruptionsinperception, psychomotorskills, psychomotorbehavior': 'Altered mental status',	
	    'anger, apathy, behaviorchanges, confusion, decreasedability, erraticbehavior, languageproblems, lossofbladdercontrol, lossofbowelcontrol, memoryloss, moodchanges, poorhygiene, poorjudgement, quarrelsomeness': 'alzheimer disease',	
	    'insuffiicientcleaning, ingestingspicyfoods, diarrhea, analtear, fungalinfection, hemorrhoids, pinworms, abrasion, analleakage': 'Anal itching'	,
	    'hives, difficultybreathing, feelingofimpendingdoom, reducedbloodpressure': 'Anaphylaxis',	
	    'easyfatigue, lossofenergy, rapidheartbeat, shortnessofbreath, headache, difficultyconcentrating, dizziness, paleskin, legcramps, insomnia': 'Anemia',
	    'abdomenpain, appetiteloss, nausea, vomiting, abdominalswelling, temperature, constipation, diarrheawithgas': 'Appendicitis',	
	    'facialpain, stuffedupnose, lossofsmell, cough, congestion, fever, badbreath, fatigue, dentalpain':	'Acute sinusitis',
	    'chappedlips, crackedlips, drooling, drymouth, lippain, liptenderness, lipulceration, reddenedlips, reddenedskin': 'angular cheilitis',
	    'ankle swelling,, numbness, tingling, instability, burningpain, inabilitytobearweight, stiffness, weakness': 'Ankle  pain',
	    'palpitations, sweating, irritability, feelingofstress': 'Anxiety',
	    'wheezing, shortnessofbreath, chestpain, nighttimecough': 'Asthma',
	    'shortnessofbreath, palpitation, lightheadedness, fatigue, confusion, reducedtoleranceforexercise': 'atrial fibrillation',
	    'chills, fever, cough, headache, tiredness, sorethroat, runnynose, eyepain, insomnia, malaise, lethargy eyeinfections, nausea, vomiting, muscleaches, diarrhea': 'bird flu',
	    'dullache, numbness, tingling, sharppain, pulsatingpain, painwithmovementofspine, musclespasm, tenderness, sciatica, rash, lossofcontinenceofbowel, lossofcontinenceofbladder': 'Back pain',
	    'poororalhygiene, gumdisease, toothdecay, mouthinfection, infectioninlungs, sinuses': 'Bad breath',
	    'poordentalhealth, poorhygiene': 'Bad taste',
	    'malnutrition, heartattack, liverdiseases, severeinfections, metabolicdisturbances, trauma, injury': 'Beau’s lines',
	    'bloodclotsinurine, painduringurination, urinatingsmallamounts, urinarytractinfections': 'BladderCancer',
	    'lumpinthebreast, swellinginthearmpit, paininthebreast, anychangeinthesize,  anychangeinthecontour, anychangeinthetexture, nippleretraction, ulceration, unusualdischargefromnipple': 'breast Cancer',
	    'visionproblems, blurringvision, lossofbalance, nausea, vomiting, hearingloss, dizziness, sensationthattheroomisspinning, vertigo ': 'Benign positional vertigo',
	    'recurringepisodesofbingeing, eatingexcessiveamountoffood, vomiting, exercising, medicationabuse, eatingunderstress, rapideating, shame, eatingalone, depression, guiltfeelings': 'Binge eating disorder',
	    'agitation, appetitechanges, depressedmood, elevatedmood, feelingsofhopelessness, grandiosethoughts, impulsivity, moodchanges, poorjudgement, pressuredspeech, restlessness, sleepchanges, suicidalchanges, tangentialspeech': 'Bipolar disorder',
	    'bloodyurine, burningurination, cloudyurine, difficultyurinating, lowerabdominalpain, painfulurination, pelvicpain, rectalpain,  urinaryfrequency, urinaryurgency': 'Bladder infection',
	    'leakageofurine, overactivebladder, cramping, burning, pain': 'Bladder spasms',
	    'bleeding, redness, painfulgums, soregums': 'Bleeding gums',
	    'skinrashes, inflammatoryconditions': 'Blisters',
	    'swellingofaffectedarea, warmth, rednes, pain, painininvolvedarea, pallor, whiteningofthearea, weakness, lossofsensation, paralysis, abdominalpain, chestpain, confusion, diarrhea, dizziness, headache, shortnessofbreath, slurredspeech, visionchanges': 'Blood cot',
	    'inflammationofseminalvesicles, inflammationofprostrategland': 'blood in semen',
	    'speakinginmonotonevoice, reductioninfacialexpressions, reductioninemotions, depression': 'blunted affect',
	    'acutebronchitis, pneumonia': 'bloody sputum',
	    'lackofsharpnessofvision, migraine, stroke, headache, sensitivitytolight, redness, irritationofeyes': 'blurred vision',
	    'decreaseddensityofbone': 'bone loss',
	    'rectalincontinence, inabilitytoholdstoolinrectum': 'bowel incontinence',
	    'blurredvision, fainting, headache, lossofconsciousness, nausea, neckpain, seizures, sensitivitytolight, speechchanges, visiondisturbances, vomiting': 'brain aneurysm',
	    'anxiety, blurredvision, fainting, memoryloss, mentalfogginess, nervousness, headache, feelingfoggy, nausea, lightheadness, dizziness, emotionalchanges, difficultyconcentrating, seizure, tiredness, vomiting': 'brain trauma',
	    'balanceproblems, gaitdisturbances, headache, hearingchanges, memoryproblems, nausea, numbness, personalitychanges, seizures,  speechchanges, tingling, visionchanges, vomiting, weakness': 'brain tumor',
	    'breastlump, breastpain, breastswelling, changeinbreastsize, changeinbreastshape, dimplingofbreastskin, bloodynippledischarge, nipplepain, nippleinversion, rednessofbreastskin': 'breast cancer',
	    'breastpain, redness, warmth, tenderness, nippledischarge, skininflammation, rash': 'Breast lumps',
	    'nailseasilycracked, nailseasilychipped, nailseasilypeeled': 'brittle nails',
	    'bodyaches, chestpain, chestsoreness, chills, cough, dyspnea, fatigue, fever, headache, shortnessofbreath, sorethroat, wateryeyes, wheezing': 'Bronchitis ',
	    'skinrash, infections': 'Bumps on skin',
	    'paininaffectedarea, tendernessoveraffectedbursa, limitationofmovement': 'Bursitis',
	    'congestion, nasalobstruction, nasalblockage, pusinnasalcavity, fever, runnynose': 'Chronic Sinusitis',
	    'irondeficiency, bonepain, arthritis, depression, tinglingnumbnessinhands, tinglingnumbnessinfeet, seizures, irregularmestrualperiods, itchyskin, mouthsores': 'Celiac disease',
	    'abnormalvaginaldischarge, bleedingbetweenperiods, painfulperiods, abdominalpain, fever, itching, painwhenurinating': 'Chlamydia in women',
	    'painfulurination, burningaroundopeningofpenis, itchingaroundopeningofpenis, painaroundtesticles, swellingaroungtesticles': 'Chlamydia in men',
	    'bleedingfromsoreinthroat, cough, earpain, enlargelymphnodes, headache, hoarseness, lumpinthroat, neckpain, painfulswallowing, redpatchesonliningofthroat, ringingintheears, sorethroat, swelling, troublebreathing, troublespeaking ': 'Cancer throat',
	    'abdominalpain, agitation, chestpain, confusion, depression, diarrhea, distractibility, dizziness, fainting, fatigue, hallucinations, headache, impulsiveness, irritability, lethargy, malaise, memoryproblems, mausea, seizures, shortnessofbreath, urinaryincontinence, visualdisturbances, vomiting, weakness': 'Carbon monoxide poisoning',
	    'armpain, handburningsensation, handnumbness, handpain, handtingling, handweakness, lossofgripstrength, musclecrampinginhand, musclewastinginhand': 'carpaltunnel',
	    'enlarged lymph nodes, fatigue, fever, headache, irritationoftheeyes, jointpains, loss of appetite, malaise, mental status changes, numbness of extremities, rash, seizures, skin bump, sore throat, tender lymph nodes, tingling of extremities, weight loss': 'Catscratch',
	    'rigidity, staring, withdrawal, immobility, posturing, grimacing': 'Catatonia',
	    'chills, enlargedlymphnodes, enlargingskinsore, fatigue, fever, pain, redstreaksontheskin, reddenedskin, swelling, tenderness, tightappearanceofskin ,stretchedappearanceofskin, warmskin': 'Cellulitis',
	    'abnormalvaginalbleeding, bleedingaftersexualintercourse, bleedingbetweenperiods, heavymenstrualperiods, painfulintercourse, pelvicpain, vaginaldischarge': 'Cervical cancer',
	    'abdominalpain, burningonurination, painwithurination, pelvicpain, peniledischarge, rectalbleeding, rectaldischarge, rectalpain, testicularpain, urinaryurgency, urinatingfrequently, vaginaldischarge': 'Chlamydia',
	    'balanceproblems, chills, depression, diarrhea, dizziness, doublevision, earache, fainting, fatigue, fever, food sensitivities, headaches, impaired shorttermmemory, jointpain, malaise, moodchanges, musclepain, nightsweats, poorconcentration, sorethroat, tenderlymphnodes, unrefreshingsleep, visiondisturbances': 'Chronic fatigue',
	    'chills, cough, difficultyswallowing, enlargedtonsils, fatigue, feelingofalumpinthethroat, fever, heartburn, hoarseness, mouthsores, ulcers, rednessofthethroat,  regurgitation, sorethroat': 'Chronic sore throat',
	    'abdominalcramps, abdominalpain, bloating, bloodinstool, chills, diarrhea, fatigue, fever, jointswelling, mouthulcers, rectalulcers, skinsores, weakness, weightloss': 'Colitis',
	    'abdominalcramping, abdominalmass, abdominalpain, abdominaltenderness, bloating, bloodinstool, changeinbowelhabits, constipation, darkstool, diarrhea, fatigue, narrowstools, shortnessofbreath, weakness, weightloss': 'Colon cancer: ',
	    'blisters, chappedskin, redskin, scalyskin, skinburning, skinfissures, skinitching, skinpain, skinrash, stinging, swelling, thickenedskin, weeping, oozingblisters': 'Contact dermatitis',
	    'Bluishdiscolorationoftheskin, Chesttightness, cough, coughingupblood, exerciseintolerance, fingerclubbing, frequentrespiratoryinfections, morningheadaches, shortnessofbreath, sputumproduction, swellingofthefeet swellingoftheankles, weightloss, wheezing': 'Copd',
	    'abdominalcramping, abdominalpain, analfissure, anemia, backpain, bloodinthestool, bloodydiarrhea, burningeyes, chills, dehydration, diarrhea, eyepain, fatigue, fever, jaundice, jointpain, jointswelling, lossofappetite, malaise, mouthulcers, musclepain, nausea, nightsweats, paleskin, rash, rectalbleeding, rectalpain, vomiting': 'Crohn’s disease',
	    'abdominaldistension, abdominalpain, chestpain, constipation, cough, coughingupblood, decreasedexercisetolerance, failuretothrive, fatigue, fattystools, fingerclubbing, flatulence, foulsmellingstools, malnutrition, nasalcongestion, nasalpolyps, poorgrowth, saltysweat, shortnesofbreath, sinuspain, sputumproduction, vitamindeficiency, vomiting, weakness, wheezing': 'Cystic fibrosis',
	    'burping, nauseaaftereating, Stomachfullness, stomachbloating, Upperabdominalpain ': 'Dyspepsia',
	    'suddenhighfever, severeheadaches, painbehindtheeyes, severejoint, musclepain, fatigue, nausea, vomiting, skinrash, mildbleeding': 'Dengue fever',
	    'feelingsad, anxious, feelinghopeless, feelingguilty, helpless, troublewithconcentration, troublewithmemory, sleepingtoomuch, sleepingtoolittle, appetitechanges, gainingweight, losing weight, feelingrestless, irritable, thoughtsofsuicide': 'Depression',
	    'increasedthirst, increasedurination, increasedhunger, blurredvision': 'Gestational diabetes',
	    'heavythirst, increasedhunger, drymouth, nausea, vomiting, paininyourbelly, frequentlyurination, unexplainedweightloss, fatique, blurredvision, heavybreathing, laboredbreathing, frequentinfectionsoftheskin': 'Diabetes type 1',
	    'beingverythirsty, peeingalot, blurryvision, beingirritable, tinglinginhands, tinglinginfeet, numbnessinhands, numbnessinfeet, feelingwornout, woundsthatdon’theal, yeastinfections': 'Diabetes type 2',
	    'bloatinginyourbelly, cramps, thinstools, loosestools, nausea, throwingup, bloodinyourstool, mucusinyourstool, weightloss, fever': 'Diarrhea',
	    'bellypain, fever, chills, bloating, gas, diarrhea, constipation, nausea, notfeelinglikeeating': 'Diverticulitis',
	    'earpain, fever, drainagefromtheear, lossofappetite, vomiting, grumpybehavior, troublesleeping': 'Earinfection',
	    'dramaticweightloss, wearingloose, preoccupationwithfood, preoccupationwithdieting, refusaltoeatcertainfoods, avoidingmealtimes, exercisingexcessively, stoppingmenstruating': 'Eating disorder',
	    'afeelingoffullness, discomfortinyourbelly, yellowingofskin, fatigue, weakness, nausea, weightloss': 'Enlarged liver',
	    'itchyskin, dryskin, thickenedskin': 'Eczema',
	    'soreeyes, irritatedeyes, troublefocusing, dryeyes, wateryeyes, blurredvision, doublevision, increasedsensitivitytolight, painintheneck, paininshoulders': 'Eye fatigue',
	    'difficultystartingaurinestream, weakflow, dribblingafterurination, feelingofnonemptybladder, anurgetourinateagain, painduringurination': 'Bladder emptying',
	    'anxiety, depression': 'Fatigue',
	    'involuntaryreleaseofurinewhenyoucough,  involuntaryreleaseofurinewhenyousneeze, involuntaryreleaseofurinewhenyoulaugh, leakingofurine': 'Stress incontinence',
	    'frequentneedtourinate, suddenneedtourinate, leakingofurine': 'Urge incontinence',
	    'heavybleeding, painfulperiods, bleedingbetweenperiods, pressureinlowerstomach, paininlowerstomach, enlargedabdomen, constipation, miscarriages, infertility': 'Uterine fibroids',
	    'diarrhea, nausea, vomiting, abdominalcramps': 'Food poisoning',
	    'yellowingoftheskin, darkurine, lightcoloredstools, fever, chills': 'Gallstone',
	    'nausea, recurrentupsetstomach, abdominalbloating, abdominalpain, vomiting, indigestion, burninginstomach, gnawingfeelinginstomach, hiccups, lossofappetite, vomitingblood, blackstools, tarrystools': 'Gastritis',
	    'easybruising, nosebleeds, fatigue, enlargedspleen, enlargedliver, paininbone, arthritis, breaks': 'Gaucher’s disease',
	    'warmth, pain, swelling, extremetendernessinajoint, veryredskinaroundaffectedjoint, purplishskinaroundaffectedjoint, limitedmovementinaffectedjoint, itchingoftheskinaroundaffectedjoint': 'Gout'

};


bot.dialog('/symptomsChecker', [
    function (session) {
        var symptoms = session.userData.symptoms;
        var cleanedSymptomsFromPatient = symptoms.replace(/\s/g, '').toLowerCase();
        var multipleSymptomObj = {};

        lodash.each(symptomDB, function (diseaseName, symptomNames) {
            var cleanedSymptomKey = symptomNames.replace(/\s/g, '').toLowerCase();

            if (lodash.includes(cleanedSymptomKey, cleanedSymptomsFromPatient)) {
                multipleSymptomObj[diseaseName] = cleanedSymptomKey;
            }
        });
        session.userData.diagnosedDiseaseInfo = multipleSymptomObj;
        session.endDialog();
    }
]);


bot.dialog('/multipleDiseases', [
    function (session) {
        var possibleDiseaseInfo = session.userData.diagnosedDiseaseInfo;
        var possibleDiseaseCards = [];
        lodash.each(possibleDiseaseInfo, function (possibleDiseaseSymptoms, possibleDiseaseName) {
            possibleDiseaseCards.push(new builder.HeroCard(session)
                .title(possibleDiseaseName)
                .subtitle('do you have these symptoms?')
                .text(possibleDiseaseSymptoms)
            .buttons([
                builder.CardAction.imBack(session, possibleDiseaseName, 'Submit')
            ]))
        });

        var reply = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(possibleDiseaseCards);

        session.send(reply);
        session.endDialog();
    }
]);


var recommendationDB = {
    'Flu': 'crocin',
    'heart attack': 'call 101/911 or rush to the nearest hospital',
    'Acid Reflux': 'Maalaox',	
    'Attention deficit hyperactivity disorder':	'Atomoxetine',
    'Allergy':	'allegra',
    'Anal itching':	'Anucort-HC rectal',
    'Anaphylaxis': 'EpiPen',
    'Anemia': 'Cyanocobalamin',
    'Appendicitis':	'Ampicillin',
    'Acute sinusitis':	'Aspirin',
    'Angular cheilitis': 'Nystatin',
    'Ankle pain':	'Naprosyn',
    'Anxiety':	'Xanax',
    'Asthma':	'Albuterol',
    'Atrial fibrillation':	'Flecainide',
    'Bird flu':	'Oseltamivir (Tamiflu',
    'Back pain': 'ibuprofen',
    'Bad breath': 'brush your teeth and gums at least twice a day',
    'Binge eating disorder':	'Lisdexamfetamine',
    'Bladder spasms':	'Fosfomycin',
    'Blisters':	'Tylenol',
    'Blood cot':	'Apixaban (Eliquis)',
    'Bronchitis':	'Paracetamol',
    'Celiac disease':	'Foods that contain gluten',
    'Carpal Tunnel':	'ibuprofen',
    'Chronic fatigue':	'bupropion',
    'Gestational diabetes':	'Glynase',
    'Diabetes type 1':	'Insulin isophane (Humulin N, Navolin N',
    'Diabetes type 2':	'Loperamide(Imodium',
    'Diverticulitis':	'Metronidazole',
    'Ear infection': 'Acetaminophen(Tylenol) or ibuprofen(Advil)',
    'Eating disorder':	'Fluoxetine (Prozac)',
    'Enlarged liver':	'A healthy diet, regular exercise and weight loss',
    'Fatigue':	'Acetaminophen (Tylenol) or ibuprofen(Advil)',
    'Urge incontinence': 'oxybutynin (Ditropan XL), tolterodine (Detrol)',
    'Uterine fibroids':	'Lupron, Synare',
    'Food poisoning':	'loperamide (Imodium A-D)',
    'Gastritis': 'omeprazole (Prilosec), lansoprazole (Prevacid)',
    'Gout':	'ibuprofen (Advil), and naproxen'
    
    
    
    
};

bot.dialog('/recommendation', [
    function (session) {
        var patientDiseaseName = session.message.text;
        var recommendationFound = false;
        var recommendationGiven = 'NA';

        lodash.each(recommendationDB, function (recommendationName, diseaseName) {
            if (!recommendationFound) {
                if (lodash.includes(diseaseName, patientDiseaseName)) {
                    recommendationFound = true;
                    recommendationGiven = recommendationName;
                }
            }
        });
        session.userData.recommendationGivenName = recommendationGiven;
        session.send("Recommendation Given : " + recommendationGiven);

        session.endDialog();
    }
]);