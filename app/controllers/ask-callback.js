controller.hears(['question me'], 'message_received', function(bot, message) {

    // start a conversation to handle this response.
    bot.startConversation(message, function(err, convo) {

        convo.ask('How are you?', function(response, convo) {

            convo.say('Cool, you said: ' + response.text);
            convo.next();

        });

    })

});
