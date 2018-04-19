var server = require('./server');
var moment = require('moment');
var momentTimezone = require('moment-timezone');
var fs = require('fs');
var jwt = require('jwt-simple');
var path = require('path');
var config = require('../config.json');

module.exports = {

	handleError: function(res, reason, message, code){
		console.log("ERROR: " + reason);
		res.status(code || 500).json({"status":"failure","message": message});
	},

	healthcheck: function(req, res){
		var newTimeZoneValue = module.exports.getTime();
		//console.log(module.exports.randomstring.generate(20));
		res.status(200).json({"status":"success", "locale":momentTimezone.tz.guess(), "timeInMs":newTimeZoneValue});
	},

	getTime: function(req, res){
		var serverTime = moment().format("YYYY-MM-DD HH:mm:ss"); 
		var oldTimeZone = momentTimezone.tz(serverTime, momentTimezone.tz.guess());
		var newTimeZoneValue = oldTimeZone.tz("Asia/Calcutta").format("DD MMM hh:mm:ss a");
		return newTimeZoneValue;
	},

	getTimeInMs: function(req, res){
		var serverTime = moment().format("YYYY-MM-DD HH:mm:ss"); 
		var oldTimeZone = momentTimezone.tz(serverTime, momentTimezone.tz.guess());
		var newTimeZoneValue = oldTimeZone.tz("Asia/Calcutta").valueOf().toString();
		return newTimeZoneValue;
	},

	getTimeForTechDay: function(req, res){
		var serverTime = moment().format("YYYY-MM-DD HH:mm:ss"); 
		var oldTimeZone = momentTimezone.tz(serverTime, momentTimezone.tz.guess());
		var newTimeZoneValue = oldTimeZone.tz("Asia/Calcutta").format("hh:mm:ss a");
		return newTimeZoneValue;
	},

	checkDirectory: function(directory, callback){
		try {
			fs.statSync(directory);
			// console.log("Using Existing "+directory);
		} catch(e) {
			// console.log("Creating "+directory);
			fs.mkdirSync(directory);
		} finally {
			callback();
		}
	},

	authenticate: function(req, res){
		var token = req.headers['access-token'];
		var platform = req.headers['platform'];
		var identity = req.headers['identity'];

		if(token){
			var logDirectoryPath = path.join(__dirname, "../../logs");
			module.exports.checkDirectory(logDirectoryPath, function(error){
				if(error){
					module.exports.handleError(res, error.message, "Failed to create logs directory");
					return;
				}
				else {
					var currentDate = moment().format("DD_MMM");
					var fileName = logDirectoryPath + "/" + currentDate + ".csv";
					var timeStamp = module.exports.getTime();
					var data = req.originalUrl + ",";
					if(platform)
						data += platform;
					data += ",";
					if(identity)
						data += identity;
					data += ",";
					data += timeStamp + "\n";
					fs.appendFile(fileName, data, function(err){
						if(err){
							module.exports.handleError(res, error.message, "Failed to insert logs");
							return;
						}
					});
				}
			});
			try {
				var db = server.database;
				var decoded = jwt.decode(token, config.secretKey);
				var serverTimeInMs = module.exports.getTimeInMs();
				if(decoded.exp <= serverTimeInMs){
					// return "expired";
					res.setHeader('message', 'Token Expired');
					res.status(401).json({"status":"failure", "message":"Token Expired"});
					return null;
				} else {
					return decoded.iss;
				}
			}
			catch (err) {
				// return "invalid";
				res.setHeader('message', 'Token Invalid');
				res.status(401).json({"status":"failure", "message":"Token Invalid"});
				return null;
			}
		} else {
			// return "missing";
			res.setHeader('message', 'Token Missing');
			res.status(401).json({"status":"failure", "message":"Token Missing"});
			return null;
		}
	}
};