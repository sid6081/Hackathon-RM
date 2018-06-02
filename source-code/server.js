var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require("mongodb");

var config = require('../config.json');
var employee = require('./employee.js');
var login = require('./login.js');
var customer = require('./customer.js');
var map = require('./map.js');

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

var db;

mongodb.MongoClient.connect(config.mongoUrl, function (err, database) {
	if (err) {
		console.log("ERROR:"+err);
		process.exit(1);
	}
	// Save database object from the callback for reuse.
	db = database;
	console.log("Database connection ready");
	module.exports.database = db;
	// Initialize the app.
	var server = app.listen(process.env.PORT || 8005, function () {
	    var port = server.address().port;
	    console.log("App now running on port", port);
	});
});

// app.all("/Employee", employee.employee);

// app.post("/Login", login.login);

// app.all("/Customer", customer.customer);

// app.post("/Event/insert", customer.insertEvent);

// app.post("/Event", customer.event);

// app.all("/Rating", customer.rating);

app.all("/Map", map.map);