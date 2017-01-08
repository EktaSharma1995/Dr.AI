var restify = require('restify');
var builder = require('botbuilder');
//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
server.listen(3000, function() {
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
bot.on('contactRelationUpdate',function(message) {
					if (message.action === 'add') {
						var name = message.user ? message.user.name : null;
						var reply = new builder.Message()
						.address(message.address)
						.text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.",
						name || 'there');
						bot.send(reply);
					} else {
					// delete their data
					}
				});
bot.on('typing', function(message) {
	// User is typing
});
bot.on('deleteUserData', function(message) {
	// User asked to delete their data
});
//=========================================================
// Bots Dialogs
//=========================================================
String.prototype.contains = function(content) {
	return this.indexOf(content) !== -1;
}

bot.dialog('/', 
		[ 
		  function(session) {
			  session.beginDialog('/name');
		  },
		  function(session) {
			  session.beginDialog('/age');
		  },
		  function(session) {
			  session.beginDialog('/gender');
		  },
		  function(session) {
			  session.beginDialog('/symptoms');
		  },
		  function(session) {
			  session.beginDialog('/region');
		  }
		  
		 ]);

bot.dialog('/name', [ 
         function(session, args, next) {
        	 builder.Prompts.text(session, "What's your name?");
         		}, 
         function(session, results, next) {
         	 session.dialogData.name = results.response;
         	 session.endDialog();
         		 }
         		]);

bot.dialog('/age', [ 
                     function(session, args, next) {
                    	 builder.Prompts.text(session, "What's your age?");
                     		}, 
                     function(session, results, next) {
                     	 session.dialogData.age = results.response;
                     	 session.endDialog();
                     		}
                     ]);

bot.dialog('/gender', [ 
                     function(session, args, next) {
                    	 builder.Prompts.text(session, "What's your gender?M/F");
                     		}, 
                     function(session, results, next) {
                     	 session.dialogData.gender = results.response;
                     	 session.endDialog();
                     		 }
                     		]);

bot.dialog('/symptoms', [ 
                     function(session, args, next) {
                    	 builder.Prompts.text(session, "What's your symptoms?");
                     		}, 
                     function(session, results, next) {
                     	 session.dialogData.symptoms = results.response;
                     	 session.endDialog();
                     		 }
                     		]);
bot.dialog('/region', [ 
                       function(session, args, next) {
                      	 builder.Prompts.text(session, "What's your region?");
                       		}, 
                       function(session, results, next) {
                       	 session.dialogData.region = results.response;
                       	 session.endDialog();
                       		 }
                       		]);

//var symptoms= "cold,cough,fever";

bot.dialog('/diseases', [ 
                         function(session, args) {
                         var diseaseDB = {
                        		 'flu': 'cold, cough, fever',
                        		 'strepThroat': 'cold, cough, fever, sorethroat',
                        		 'earinfection': 'cold, cough, fever, earpain',
                        		 'acidreflux': 'regurgitation,dyspepsia, heartburn',
                        		 'Dyspepsia': 'Burping,Nauseaaftereating,Stomachfullness,Upperabdominalpain,discomfort'  
                        	}
                         }
                     ]);                     
                       
bot.dialog('/symptomschecker', [ 
                 function(session,args){
                    	   for (var key in diseaseDB) {
                       		  if (diseaseDB.symptoms(key)) {
                       		    console.log(key,value  + " -> " + diseaseDB[key], +diseaseDB[value]);
                       		  }
                    	   }
                       }
              ]);







//if (value.includes(userSymptoms)) { display key (disease name)}







//bot.dialog('/', [
//                 function (session, args, next) {
//                     if (!session.userData.name) {
//                         session.beginDialog('/name');
//                     } else {
//                         next();
//                     }
//                 },
//                 function (session, results) {
//                     session.send('Hello %s!', session.userData.name);
//                 }
//             ]);
//
//		    bot.dialog('/name', [
//			     function (session) {
//				 builder.Prompts.text(session, 'Hi! What is your name?');
//				 },
//				 function (session, results) {
//				 session.userData.name = results.response;
//			     session.endDialog();
//				 }
//		      ]);
//		    
// bot.dialog('/', [
//                  function (session, args, next) {
//                      if (!session.userData.age) {
//                          session.beginDialog('/age');
//                      } else {
//                          next();
//                      }
//                  },
//                  function (session, results) {
//                      session.send('Hello %i!', session.userData.age);
//                  }
//              ]);
//
//  bot.dialog('/age', [
//      function (session) {
//          builder.Prompts.text(session, 'Hi! What is your age?');
//      },
//      function (session, results) {
//          session.userData.age = results.response;
//          session.endDialog();
//      }
//  ]);
//
//  bot.dialog('/', [
//                   function (session, args, next) {
//                       if (!session.userData.gender) {
//                           session.beginDialog('/gender');
//                       } else {
//                           next();
//                       }
//                   },
//                   function (session, results) {
//                       session.send('Hello %s!', session.userData.gender);
//                   }
//               ]);
//
//   bot.dialog('/gender', [
//       function (session) {
//           builder.Prompts.text(session, 'Hi! What is your gender?');
//       },
//       function (session, results) {
//           session.userData.gender = results.response;
//           session.endDialog();
//       }
//   ]);  
//
//

//bot.dialog('/', [
//                 function (session) {
//                	 builder.Prompts.text(session, 'Hi! What is your name?');
//                 },
//                 function (session, results) {
//                	 session.userData.name = results.response;
//                	 session.endDialog();
//         	        session.send('Hello %s!', session.userData.name);
//                 },
//                 
//                 bot.dialog('/profile', [
//                                         function (session) {
//                                             builder.Prompts.text(session, 'Hi! What is your name?');
//                                         },
//                                         function (session, results) {
//                                             session.userData.name = results.response;
//                                             session.endDialog();
//                                         }
//                                     ]
//                ]);

//bot.dialog('/', function (session) {
//	console.log(session.message.text);
//    if(session.message.text.toLowerCase().contains('hello')){
//      session.send('Hey, How are you?');
//      }else if(session.message.text.toLowerCase().contains('help')){
//        session.send('How can I help you?');
//      }else{
//        session.send('Sorry I do not understand you...');
//      }
//]);

