/* eslint-disable brace-style */
/* eslint-disable camelcase */

module.exports = function(controller, watsonMiddleware) {

    var interval = 10 * 1000;

    function checkLeafNode(message) {
        if (message.watsonData && message.watsonData.context && message.watsonData.context.system &&
            message.watsonData.context.system.branch_exited && message.watsonData.context.system.branch_exited === true) {
            return true;
        }
        return false;
    }

    var helpMenuOptions = [{
        'content_type': 'text',
        'title': 'Practical stories on tech',
        'payload': 'I want practical stories around how others are using technology?'
    }, {
        'content_type': 'text',
        'title': 'Browse headlines',
        'payload': 'I just want to browse headlines and get inspired by what is happening out there across Technology and across Industry'
    }, {
        'content_type': 'text',
        'title': 'Learn a given technology',
        'payload': 'I want to learn about a given technology - 101 sort of thing'
    }, {
        'type': 'postback',
        'title': 'What happening in my industry',
        'payload': 'I want to get a feel of what is happening in my industry...'
    }, {
        'type': 'postback',
        'title': 'Get started with technology',
        'payload': 'I want you to learn how to make it happen - how do I get started with technology?'
    }, {
        'type': 'postback',
        'title': 'How to get more innovative',
        'payload': 'I want to help my company become more innovative and agile'
    }];


    // this is triggered when a user clicks the send-to-messenger plugin
    controller.on('facebook_optin', function(bot, message) {

        // bot.reply(message,
        //     'Welcome to the Gameof.Tech! I am your tech-bot and I am here to look after you! Can you help me get a sense of what you are looking for?')

        bot.reply(message, {
            "text": "Welcome to the Gameof.Tech! I am your tech-bot and I am here to look after you! Can you help me get a sense of what you are looking for? You can type 'Help Menu' for the options",
            "quick_replies": helpMenuOptions
        });
    })

    controller.on('facebook_postback', function(bot, message) {
        // console.log('////////////// POSTBACK MESSAGE:' + JSON.stringify(message))
        // console.log('////////////// POSTBACK PAYLOAD:' + JSON.stringify(message.payload))
    })

    controller.on('tick', function(bot, event) {})

    controller.on('message_delivered', function(bot, message) {
        // console.log('////////////// DELIVERED MESSAGE:' + JSON.stringify(message))
        // console.log('////////////// DELIVERED PAYLOAD:' + JSON.stringify(message.payload))
    })

    controller.on('message_received', function(bot, message) {})

    // user says anything else
    controller.hears('(.*)', 'direct_mention,direct_message,message_received',
        function(bot, message) {

            console.log('////////////// RECEIVED MESSAGE:' + JSON.stringify(message))
                // console.log('////////////// RECEIVED MESSAGE:' +message)
            message.watsonData.input.text = message.text;
            var intent;

            if (message.watsonData && message.watsonData.intents && message.watsonData.intents.length > 0) {

                intent = message.watsonData.intents[0].intent;
                controller.debug('INTENT:' + intent)
            }
            if (intent === 'Help_Menu') {

                console.log('message.watsonData.output.text:'+message.watsonData.output.text)

                bot.reply(message, {
                    "text": message.watsonData.output.text.join('\n'), // 'These are the options',
                    "quick_replies": helpMenuOptions
                });
            } else {
                bot.reply(message, message.watsonData.output.text.join('\n'));
            }



            // if (checkLeafNode(message)){
            //     setTimeout(function() {
            //         bot.reply(message, {
            //             "text": "If you still have time to explore you might be interested in",
            //             "quick_replies": helpMenuOptions
            //         });
            //     }, interval);
            // }
        })

}
