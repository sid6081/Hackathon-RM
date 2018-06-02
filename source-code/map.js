var extensionMethods = require('./extensionMethods');
var server = require('./server');
var config = require('../config.json');
var constants = require('../constants');

var CUSTOMER_COLLECTION = constants.CUSTOMER_COLLECTION;
var EVENT_COLLECTION = constants.EVENT_COLLECTION;
var RATING_COLLECTION = constants.RATING_COLLECTION;
var MAP_COLLECTION = constants.MAP_COLLECTION;

module.exports = {

	map : (req, res) => {
		if(req.method === 'GET'){
			getMapDataPoint(req, res);
		} else if(req.method === 'POST'){
			insertMapDataPoint(req, res);
		} else if(req.method === 'PUT'){
			updateMapDataPoint(req, res);
		} else if(req.method === 'DELETE'){
			removeMapDataPoint(req, res);
		} else {
			var msg = req.method + ' is not defined for ' + req.url;
			res.status(200).json({"status":"faliure", "message":msg})
		}
    }
}

getMapDataPoint = (req, res) => {
    var db = server.database;
    var cursor;
    if(req.headers['customerid']) {
        cursor = db.collection(MAP_COLLECTION).find({"customerid":req.headers['customerid']});
    } else {
        cursor = db.collection(MAP_COLLECTION).find();
    }
    var employeeJsonResponse = [];
    cursor.each(function(err, doc) {
        if(doc !== null) {
            employeeJsonResponse.push(doc);
        } else {
            res.status(200).json({"response":employeeJsonResponse});
        }
    });
}

insertMapDataPoint = (req, res) => {
    if(Object.keys(req.body).length !== 0){
        var mapJson = req.body;
        var db = server.database;
        db.createCollection(MAP_COLLECTION, function(req, collection) {
            collection.insert(mapJson, function(err) {
                if (err) {
                    extensionMethods.handleError(res, err.message, "Failed to add map data.");
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