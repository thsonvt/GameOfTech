/* eslint-disable brace-style */
/* eslint-disable camelcase */
// CONFIG===============================================
/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit')
var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/botkit-demo'
var db = require('../../config/db')({ mongoUri: mongoUri })

var app = require('../../server.js');

var controller = Botkit.facebookbot({
    debug: true,
    access_token: process.env.FACEBOOK_PAGE_TOKEN,
    verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
    storage: db
})


var bot = controller.spawn({})

///////////////////////////////// WATSON MIDDLEWARE

var watsonMiddleware = require('botkit-middleware-watson')({
    username: process.env.CONVERSATION_USERNAME,
    password: process.env.CONVERSATION_PASSWORD,
    workspace_id: process.env.WORKSPACE_ID,
    version_date: '2017-02-03'
});

controller.createWebhookEndpoints(app, bot);

// Customize your Watson Middleware object's before and after callbacks.
watsonMiddleware.before = function(message, conversationPayload, callback) {

    if (message.payload){
        console.log('////////////////////////// BEFORE - PAYLOAD ' + message.payload  + '\n \n');
        message.text = message.payload;

        conversationPayload.input.text = message.payload
        
    }

    console.log('////////////////////////// BEFORE - conversationPayload ' + JSON.stringify(conversationPayload)  + '\n \n');


    console.log('////////////////////////// BEFORE - MESSAGE ' + JSON.stringify(message) + '\n \n');


    callback(null, conversationPayload);
    
}

watsonMiddleware.after = function(message, conversationResponse, callback) {
        console.log('////////////////////////// AFTER - MESSAGE ' + JSON.stringify(message)  + '\n \n' );

        console.log('////////////////////////// AFTER - RESPONSE ' + JSON.stringify(conversationResponse)  + '\n \n');

        callback(null, conversationResponse);
}



///////////////////////////////// RECEIVE MIDDLEWARE
controller.middleware.receive.use(watsonMiddleware.receive);

// controller.middleware.receive.use(function(bot, message, next) {

//     // do something...
//     // message.extrainfo = 'foo';
//     console.log('////////////////////////// RECEIVE - MESSAGE ' + JSON.stringify(message));
//     next();

// });

// ///////////////////////////////// SEND MIDDLEWARE
// controller.middleware.send.use(function(bot, message, next) {

//     // do something useful...
//     console.log('////////////////////////// SEND - MESSAGE ' + JSON.stringify(message));

//     if (message.intent == 'hi') {
//         message.text = 'Hello!!!';
//     }
//     next();
// });

///////////////////////////////// HEAR MIDDLEWARE
// this example does a simple string match instead of using regular expressions
// function custom_hear_middleware(patterns, message) {

//     for (var p = 0; p < patterns.length; p++) {
//         if (patterns[p] == message.text) {
//             return true;
//         }
//     }
//     return false;
// }

// controller.hears(['hello'],'direct_mention,direct_message,message_received',custom_hear_middleware,function(bot, message) {

//     console.log('////////////////////////// HEAR - MESSAGE ' + JSON.stringify(message));
//     bot.reply(message, 'I heard the EXACT string match for "hello"');

// });

///////////////////////////////// CHANGE EARS MIDDLEWARE

// This will replace the matching function used in hears() as well as inside convo.ask(). 
// This would, for example, enable your bot to hear only intents instead of strings.
// controller.changeEars(watsonMiddleware.hear);

// controller.changeEars(watsonMiddleware.hear, function(patterns, message) {
// controller.changeEars(function(patterns, message) {    
//     console.log('////////////////////////// changeEars - MESSAGE ' + JSON.stringify(message));
//     // ... do something
//     // return true or false
//     // next();
// });


///////////////////////////////// HEARD MIDDLEWARE

// controller.middleware.heard.use(function(bot, message, next) {

//     // load internal user data and add it to the message
//     console.log('////////////////////////// HEARD - MESSAGE ' + JSON.stringify(message));
//     next();
//     // mydb.users.find({id: message.user}, function(err, user_record) {
//     //     // amend the message with a new field.
//     //     // this will now be available inside the normal handler function
//     //     message.internal_user = user_record;
//     //     // call next or else execution will stall
//     //     next();
//     // });
// });

// controller.middleware.heard.use(watsonMiddleware.hear, function (bot, message, next) {
//      // load internal user data and add it to the message
//      console.log('////////////////////////// HEARD 2 - MESSAGE ' + JSON.stringify(message));
//      next();
// });


// controller.middleware.capture.use(watsonMiddleware.receive, function(bot, message, convo, next) {

//     console.log('////////////////////////// CAPTURE');

//     // user's raw response is in message.text

//     // instead of capturing the raw response, let's capture the intent
//     if (message.intent) {
//         message.text = message.intent;
//     }

//     // what if there is a hidden payload? let's use that instead
//     if (message.payload) {
//         message.text = message.payload;
//     }

//     console.log('////////////////////////// CAPTURE - MESSAGE ' + JSON.stringify(message));

//     // what if there are entities too? we can use them as part of the conversation...
//     // if (message.entities) {
//     //     for (var e = 0; e < message.entities.length; e++) {
//     //         convo.setVar(message.entities[e].name, message.entities[e].value);
//     //     }
//     // }

//     // always call next!
//     next();

// });





///////////////////////////////// WATSON MIDDLEWARE

// SETUP
require('./facebook_setup')(controller)

// Conversation logic
require('./conversations')(controller, watsonMiddleware)

// this function processes the POST request to the webhook
var handler = function(obj) {
    controller.debug('Message received from FB')
    var message
    if (obj.entry) {
        for (var e = 0; e < obj.entry.length; e++) {
            for (var m = 0; m < obj.entry[e].messaging.length; m++) {
                var facebook_message = obj.entry[e].messaging[m]

                console.log(facebook_message)

                // normal message
                if (facebook_message.message) {
                    message = {
                        text: facebook_message.message.text,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp,
                        seq: facebook_message.message.seq,
                        mid: facebook_message.message.mid,
                        attachments: facebook_message.message.attachments
                    }

                    console.log('message.quick_reply:'+JSON.stringify(facebook_message.message.quick_reply))
                    if (facebook_message.message.quick_reply && facebook_message.message.quick_reply.payload){
                        message.payload = facebook_message.message.quick_reply.payload;
                    }

                    // save if user comes from m.me adress or Facebook search
                    create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

                    controller.receiveMessage(bot, message)
                }
                // When a user clicks on "Send to Messenger"
                else if (facebook_message.optin ||
                    (facebook_message.postback && facebook_message.postback.payload === 'optin')) {

                    message = {
                        optin: facebook_message.optin,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp
                    }

                    if (message.quick_reply && message.quick_reply.payload){
                        message.payload = message.quick_reply.payload;
                    }

                    // save if user comes from "Send to Messenger"
                    create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

                    controller.trigger('facebook_optin', [bot, message])
                }

                // clicks on a postback action in an attachment
                else if (facebook_message.postback) {
                    // trigger BOTH a facebook_postback event
                    // and a normal message received event.
                    // this allows developers to receive postbacks as part of a conversation.
                    message = {
                        payload: facebook_message.postback.payload,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp
                    }

                    controller.trigger('facebook_postback', [bot, message])

                    message = {
                        text: facebook_message.postback.payload,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp
                    }

                    controller.receiveMessage(bot, message)
                }
                // message delivered callback
                else if (facebook_message.delivery) {
                    message = {
                        optin: facebook_message.delivery,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp
                    }

                    controller.trigger('message_delivered', [bot, message])
                } else {
                    controller.log('Got an unexpected message from Facebook: ', facebook_message)
                }
            }
        }
    }
}

var create_user_if_new = function(id, ts) {
    controller.storage.users.get(id, function(err, user) {
        if (err) {
            console.log(err)
        } else if (!user) {
            controller.storage.users.save({ id: id, created_at: ts })
        }
    })
}

exports.handler = handler
    /* eslint-disable brace-style */
    /* eslint-disable camelcase */
