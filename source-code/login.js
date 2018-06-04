var server = require('./server');
var constants = require('../constants');
var extensionMethods = require('./extensionMethods');
var config = require('../config.json');

var CUSTOMER_COLLECTION = constants.CUSTOMER_COLLECTION;

module.exports = {

	login: function(req, res) {
		var db = server.database;
		if(Object.keys(req.body).length !== 0){
			db.collection(CUSTOMER_COLLECTION).count({"emailid":req.body.emailid, "password":req.body.password}, function(countErr, empCount){
				if(countErr){
					extensionMethods.handleError(res, countErr.message, "Employee Count Error");
				} else {
					if(empCount > 0){
						var cursor = db.collection(CUSTOMER_COLLECTION).find({"emailid":req.body.emailid});
						var customerJson = {};
						cursor.each(function(err, doc) {
							if(doc !== null) {
								customerJson = doc;
							} else {
								res.status(200).json({"status":"success", "response":customerJson});
							}
						});
					} else {
						res.status(200).json({"status":"failure", "message":"User not found"});
					}
				}
			});
		} else {
			res.status(400).json({"status":"failure", "message":"Request body not present"});
		}
	},

	registration: function(req, res) {
		var db = server.database;
		if(Object.keys(req.body).length !== 0){
			db.collection(CUSTOMER_COLLECTION).count({"emailid":req.body.emailid}, function(countErr, empCount){
				if(countErr){
					extensionMethods.handleError(res, countErr.message, "Customer Count Error");
				} else {
					if(empCount > 0){
						res.status(400).json({"status":"failure", "message":"EmailId already registered"});
					} else {
						var requestBody = req.body;
						db.createCollection(CUSTOMER_COLLECTION, function(req, collection) {
							collection.insert(requestBody, function(err) {
								if (err) {
									extensionMethods.handleError(res, err.message, "Failed to register customer.");
									return;
								} else {
									res.status(200).json({"status":"success", "response":"Regsitered Successfully"});
								}
							});
						});
					}
				}
			});
		} else {
			res.status(400).json({"status":"failure", "message":"Request body not present"});
		}
	}
}
