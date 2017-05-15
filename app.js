var express = require('express'); 
var http = require('http'); 
var path = require('path'); 
var logger = require('morgan')
var bodyParser = require('body-parser'); 
var fs = require('fs'); 
var cors = require('cors'); 
var obj; 

fs.readFile('instances.json','utf8', function(err, data) 
{
	if (err) 
	{
	//TODO handle this in a separate file for later. 
	console.log('Could not locate instance files'); 
	}
	else
	{
	obj = JSON.parse(data); 
	}
}); 
var app = express(); 
app.use(cors()); 
app.set('appName', 'rest_for_head'); 
app.set('port', process.env.PORT || 3011);

app.get('/instances', function(req,res) {
	res.json(obj); 
}); 

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server is listening on port ' + app.get('port'));
}); 
