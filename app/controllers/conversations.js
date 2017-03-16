/* eslint-disable brace-style */
/* eslint-disable camelcase */

module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    bot.reply(message, 'Welcome, friend')
  })

    controller.on('facebook_postback', function(bot, message) {})

    controller.on('tick', function(bot, event) {})

    controller.on('message_delivered', function(bot, message) {})

    controller.on('message_received', function(bot, message) { 
        console.log('////////////// message_received:' + JSON.stringify(message))
        bot.reply(message, message.watsonData.output.text.join('\n'));
    })

  // user said hello
  // controller.hears(['hello'], 'message_received', function (bot, message) {
  //   bot.reply(message, 'Hey there.')
  // })

  // user says anything else
  controller.hears('(.*)', 'direct_mention,direct_message,message_received', function (bot, message) {
    console.log('////////////// MESSAGE:' + JSON.stringify(message))

    if (message.watsonData && message.watsonData.intents){
        var intent = message.watsonData.intents[0].intent;
        controller.debug('INTENT:'+intent)  
    }

    bot.reply(message, message.watsonData.output.text.join('\n'));
  })
}
