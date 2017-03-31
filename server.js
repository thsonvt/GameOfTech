// modules =================================================
var express = require('express')     // framework d'appli
var app = module.exports = express()
var bodyParser = require('body-parser') // BodyParser pour POST
var http = require('http').Server(app)      // préparer le serveur web
var dotenv = require('dotenv')
var path = require('path')

var cfenv = require('cfenv') // Cloud Foundry Environment Variables
var appEnv = cfenv.getAppEnv() // Grab environment variables

// configuration ===========================================

// load environment variables,
// either from .env files (development),
// heroku environment in production, etc...

dotenv.load()
// dotenv.config({path: './.env-fasionhaus'})


app.use(express.static(path.join(__dirname, '/public')))

// parsing
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing url encoded

// view engine ejs
app.set('view engine', 'ejs')

// routes
require('./app/routes/routes')(app)

// port for Heroku
app.set('port', (process.env.PORT || 5000))

// START ===================================================
http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'))
})
