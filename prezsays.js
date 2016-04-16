var http = require('http');
var request = require('request');
var express = require('express');
var app=express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var verify_token = 'authenticated';
var token = 'CAAQrz7ZBVDicBAPYddqdnzBPvDla6F3fvvcXwVqMltaGw06GpaQTeaRH4J9OtcLQcllCjq2Sorm0ZBpVBBZBIUeyZAecM9cyw2QU9HYVsqe9Inxa4ZANlfhCF8jcGjZC06Wjv5wFQQsD78UmYXp8DpjluyXiHe3UkcZBFNfiQ0ZCEZBGhELlV0zDAXcJgZBB0AoJQuvlgjxjMTIQZDZD';

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === verify_token) {
        console.log('good');
        res.send(req.query['hub.challenge']);
    } else {
        console.log('bad');
    }
});

app.post('/webhook/', function (req, res) {
    console.log('in post webhook');
  var messaging_events = req.body.entry[0].messaging;
  for (var i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    if (event.postback) {
        text = JSON.stringify(event.postback);
        sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
        continue;
    }
    var sender = event.sender.id;
    if (event.message && event.message.text) {
      var text = event.message.text;
      if(text.indexOf('trump')>-1){
          sendTextMessage(sender, "Trumped!");
      } else if (text.indexOf('bernie')>-1){
          sendTextMessage(sender, "Feel the Bern!");
      }
      
    }
  }
  res.sendStatus(200);
});

app.listen(process.env.PORT, process.env.IP);

function sendTextMessage(sender, text) {
    console.log('in send message');
    var messageData = {
        text: text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function (error, response) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

function sendGenericMessage(sender) {
  var messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}