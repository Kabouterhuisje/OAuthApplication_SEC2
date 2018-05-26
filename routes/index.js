var express = require('express');
var router = express.Router();
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var CLIENT_ID = "1077840060836-mbsj5uokepem5blt0kv6o1nd7qgqdkdd.apps.googleusercontent.com";
var CLIENT_SECRET = "OWUhuKjQWkmzs72OVDib_OMq";
var REDIRECT_URL = "http://localhost:3000/oauth2callback";
var oauth2Client = new OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

router.get('/', function(req, res, next) {
  var scopes = [
    'https://www.googleapis.com/auth/calendar'
  ];

  var url = oauth2Client.generateAuthUrl({

    access_type: 'online',
    scope: scopes,

  });

  res.render('index', {
    title: 'OAuth Calendar Application - Made by: Dennis Tijbosch',
    authURL: url
  });
});

router.get('/oauth2callback', function(req, res, next) {

  var code = req.query.code;
  var success = false;

  oauth2Client.getToken(code, function(err, tokens) {

    if (!err) {
      oauth2Client.setCredentials(tokens);
      success = true;
    }

    res.render('auth', {
      'success': success
    });
  });
});

router.get('/events', function(req, res, next) {
  var calendar = google.calendar('v3');
  var events = [];

  calendar.events.list({
    auth: oauth2Client,
    calendarId: 'dtijbosc@avans.nl',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('ERROR: ' + err);
      res.render('events', { 'events': events });
      return;
    }

    events = response.items;

    res.render('events', { 'events': events });
  });
});

module.exports = router;
