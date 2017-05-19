var express = require('express'); 
var mongoose = require('mongoose'); 
var http = require('http'); 
var path = require('path'); 
var logger = require('morgan')
var bodyParser = require('body-parser'); 
var cors = require('cors'); 
var instanceRouter = require('./routes/routesInstance'); 
var configurationRouter = require('./routes/routesConfiguration'); 
var Instances = require('./models/instances'); 
var app = express(); 

var url = 'mongodb://localhost:27017/instances'; 
mongoose.Promise = global.Promise; 
mongoose.connect(url); 
var db = mongoose.connection; 
db.on('error', console.error.bind(console,'connection error:')); 
app.use(bodyParser.json()); 
app.use(cors()); 
app.use(instanceRouter); 
app.use(configurationRouter); 
app.set('appName', 'rest_for_head'); 
app.set('port', process.env.PORT || 3011);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server is listening on port ' + app.get('port'));
}); 
