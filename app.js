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
//TODO to serve the streams to the different users. 
//won't be used when the ngix server is being not used. 
app.use(bodyParser.json()); 
app.use(cors()); 
app.use('/stream',express.static(__dirname+'/stream')); 
app.use(instanceRouter); 
app.use(configurationRouter); 

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next)
	{
		console.log("get's to error"); 
		console.log(err); 
		//TODO is this enough. This isn't working. 
	}
	); 
}

app.use(function(err, req, res, next) {
	console.log("production " + err.message); 
}); 
app.set('appName', 'rest_for_head'); 
app.set('port', process.env.PORT || 3011);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server is listening on port ' + app.get('port'));
}); 
