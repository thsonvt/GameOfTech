/* eslint-disable brace-style */
/* eslint-disable camelcase */
var Request = require('request')

module.exports = function (controller) {
  // subscribe to page events
  Request.post('https://graph.facebook.com/me/subscribed_apps?access_token=' + process.env.FACEBOOK_PAGE_TOKEN,
    function (err, res, body) {
      if (err) {
        controller.log('Could not subscribe to page messages')
      }
      else {
        controller.log('Successfully subscribed to Facebook events:', body)
        console.log('Botkit can now receive messages')

        // start ticking to send conversation messages
        controller.startTicking()
      }
    })

  var url = 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + process.env.FACEBOOK_PAGE_TOKEN

  // set up CTA for FB page
  var form1 = {
    'setting_type': 'call_to_actions',
    'thread_state': 'new_thread',
    'call_to_actions': [
      {
        'payload': 'optin'
      }
    ]
  }

  Request.post(url, {form: form1}, function (err, response, body) {
    if (err) {
      console.log(err)
    }
    else {
      console.log('CTA added', body)
    }
  })

  // set up persistent menu
  var form2 = {
    'setting_type': 'call_to_actions',
    'thread_state': 'existing_thread',
    'call_to_actions': [
      {
        'type': 'postback',
        'title': 'Practical stories on tech',
        'payload': 'I want practical stories around how others are using technology?'
      },
      {
        'type': 'postback',
        'title': 'Browse headlines',
        'payload': 'I just want to browse headlines and get inspired by what is happening out there across Technology and across Industry'
      },
      {
        'type': 'postback',
        'title': 'Learn a given technology',
        'payload': 'I want to learn about a given technology - 101 sort of thing'
      },
      {
        'type': 'postback',
        'title': 'What happening in my industry',
        'payload': 'I want to get a feel of what is happening in my industry...'
      },
      {
        'type': 'postback',
        'title': 'Get started with technology',
        'payload': 'I want you to learn how to make it happen - how do I get started with technology?'
      },
      // {
      //   'type': 'postback',
      //   'title': 'How to get more innovative',
      //   'payload': 'I want to help my company become more innovative and agile'
      // }
    ]
  }

  Request.post(url, {form: form2}, function (err, response, body) {
    if (err) {
      console.log(err)
    }
    else {
      console.log('permanent menu added', body)
    }
  })

  // set up greetings
  var form3 = {
    'setting_type': 'greeting',
    'greeting': {
      // 'text': '"Welcome to the Gameof.Tech! I am your tech-bot and I am here to look after you! Can you help me get a sense of what you are looking for?'
      'text': '"Welcome to the Gameof.Tech!'
    }
  }

  Request.post(url, {form: form3}, function (err, response, body) {
    if (err) {
      console.log(err)
    }
    else {
      console.log('greetings added', body)
    }
  })
}

/* eslint-disable brace-style */
/* eslint-disable camelcase */
