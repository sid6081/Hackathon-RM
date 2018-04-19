var extensionMethods = require('./extensionMethods');
var server = require('./server');
var config = require('../config.json');
var constants = require('../constants');

var async = require('async');

var EMPLOYEES_COLLECTION = constants.EMPLOYEES_COLLECTION;

module.exports = {

	employee : (req, res) => {
		console.log(req.method);
		if(req.method === 'GET'){
			getEmployee(req, res);
		} else if(req.method === 'POST'){
			insertEmployee(req, res);
		} else if(req.method === 'PUT'){
			updateEmployee(req, res);
		} else if(req.method === 'DELETE'){
			removeEmployee(req, res);
		} else {
			var msg = req.method + ' is not defined for ' + req.url;
			res.status(200).json({"status":"faliure", "message":msg})
		}
	},

	getImage : (req, res) => {
		getEmployeeImage(req, res);
	}
}

getEmployee = (req, res) => {

	var afterAuthenticationTpxID = extensionMethods.authenticate(req, res);
	
	if(afterAuthenticationTpxID !== null){
		if(!config.authorizedTpxIDs.includes(afterAuthenticationTpxID)){
			res.status(401).json({"status":"failure", "message":"You are not authorized to access this."});
		} else {
			var db = server.database;
			var cursor = db.collection(EMPLOYEES_COLLECTION).find();
			var employeeJsonResponse = [];
			cursor.each(function(err, doc) {
				if(doc !== null) {
					var jsonRes = {
						"tpxID" : doc.tpxID,
						"employeeName" : doc.employeeName,
						"employeeType" : doc.employeeType,
						"isLoggedIn" : doc.isLoggedIn,
						"loggedInTime" : doc.loggedInTime,
						"isRegistered" : doc.isRegistered,
						"registeredTime" : doc.registeredTime
					};
					employeeJsonResponse.push(jsonRes);
				} else {
					res.status(200).json(employeeJsonResponse);
				}
			});
		}
	}
}

insertEmployee = (req, res) => {

	var afterAuthenticationTpxID = extensionMethods.authenticate(req, res);
		
	if(afterAuthenticationTpxID !== null){
		if(!config.authorizedTpxIDs.includes(afterAuthenticationTpxID) || req.headers['key'] !== config.authenticationKey){
			res.status(401).json({"status":"failure", "message":"You are not authorized to access this."});
		} else {
			if(Object.keys(req.body).length !== 0){
				var contactJson = req.body;
				var db = server.database;
				db.createCollection(EMPLOYEES_COLLECTION, function(req, collection) {
					collection.insert(contactJson, function(err) {
						if (err) {
							extensionMethods.handleError(res, err.message, "Failed to add employee data.");
							return;
						} else {
							res.status(200).json({"status":"success"});
						}
					});
				});
			} else {
				res.status(400).json({"status":"failure", "message":"Request body not present"});
			}
		}
	}
}

updateEmployee = (req, res) => {
		
	var afterAuthenticationTpxID = extensionMethods.authenticate(req, res);
	
	if(afterAuthenticationTpxID !== null){
		if(!config.authorizedTpxIDs.includes(afterAuthenticationTpxID) || req.headers['key'] !== config.authenticationKey){
			res.status(401).json({"status":"failure", "message":"You are not authorized to access this."});
		} else {
			var db = server.database;
			duplicateTpx = [];
			async.each(req.body, function(employee, callback){

				db.collection(EMPLOYEES_COLLECTION).count({"tpxID":employee.value}, function(countErr, empCount){
					if(countErr){
						extensionMethods.handleError(res, countErr.message, "Employee Count Error");
					} else {
						if(empCount > 0){
							var jsonBody = {};

							if(employee.tpxID)
								jsonBody.tpxID = employee.tpxID;

							if(employee.employeeName)
								jsonBody.employeeName = employee.employeeName;

							if(employee.employeeType)
								jsonBody.employeeType = employee.employeeType;

							if(employee.isLoggedIn)
								jsonBody.isLoggedIn = employee.isLoggedIn;

							if(employee.loggedInTime)
								jsonBody.loggedInTime = employee.loggedInTime;	

							if(employee.isRegistered)
								jsonBody.isRegistered = employee.isRegistered;

							if(employee.registeredTime)
								jsonBody.registeredTime = employee.registeredTime;

							db.collection(EMPLOYEES_COLLECTION).update({"tpxID":employee.value}, {$set: jsonBody}, function(err) {
								if (err) {
									extensionMethods.handleError(res, err.message, "Failed to reset Employee data");
								} else {

								}
								callback(null, duplicateTpx);
							});
						} else {
							duplicateTpx.push(employee.tpxID);
							callback(null, duplicateTpx);
						}
					}
				});
			}, 
			function(err, duplicateTpx){
				res.status(200).json({"status" : "success" , "message" : "Update success", "Duplicates": duplicateTpx});
			});
		}
	}
}

removeEmployee = (req, res) => {

	var afterAuthenticationTpxID = extensionMethods.authenticate(req, res);
	
	if(afterAuthenticationTpxID !== null){
		if(!config.authorizedTpxIDs.includes(afterAuthenticationTpxID) || req.headers['key'] !== config.authenticationKey){
			res.status(401).json({"status":"failure", "message":"You are not authorized to access this."});
		} else {
			var db = server.database;
			db.collection(EMPLOYEES_COLLECTION).drop(function(err){
				if(err){
					extensionMethods.handleError(res, countErr.message, "Employee Count Error");
				} else {
					res.status(200).json({"status":"success", "message":"Removed Employee Collection"})
				}
			});
		}
	}
}

getEmployeeImage = (req, res) => {

	var afterAuthenticationTpxID = extensionMethods.authenticate(req, res);
	
	if(afterAuthenticationTpxID !== null){
		var db = server.database;
		db.collection(EMPLOYEES_COLLECTION).count({"tpxID":afterAuthenticationTpxID}, function(err, employeeCount){
			if(employeeCount > 0){
				var client = s3.createClient({
						maxAsyncS3: 20,     // this is the default 
						s3RetryCount: 3,    // this is the default 
						s3RetryDelay: 1000, // this is the default 
						multipartUploadThreshold: 20971520, // this is the default (20 MB) 
						multipartUploadSize: 15728640, // this is the default (15 MB) 
						s3Options: {
						accessKeyId: config.aws.accessKeyId,
						secretAccessKey: config.aws.secretAccessKey
					},
				});
				var imageDirectoryPath = path.join(__dirname, "../../");
				var params = {
					localFile: imageDirectoryPath + "/Images/"+afterAuthenticationTpxID+".jpg",

					s3Params: {
						Bucket: "tesco-tech-day",
						Key: "images/"+afterAuthenticationTpxID+".jpg"
					},
				};
				var downloader = client.downloadFile(params);
				downloader.on('error', function(err) {
					// console.error("unable to download:", err.stack);
					res.status(200).json({"status":"failure", "message":"Image not found"});
				});
				downloader.on('progress', function() {
					// console.log("progress", downloader.progressAmount, downloader.progressTotal);
				});
				downloader.on('end', function() {
					console.log("done downloading");
					res.contentType('image/jpg');
					var s = fs.createReadStream(imageDirectoryPath + "/Images/"+afterAuthenticationTpxID+".jpg");
					s.on('open', function () {
						s.pipe(res);
						// console.log(res);
					});
					s.on('end', function() {
						fs.unlink(imageDirectoryPath + "/Images/"+afterAuthenticationTpxID+".jpg", function(){
							console.log("Removed");	
						});
					});
				});
			} 
		});
	}	
}
