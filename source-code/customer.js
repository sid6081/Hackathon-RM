var extensionMethods = require('./extensionMethods');
var server = require('./server');
var config = require('../config.json');
var constants = require('../constants');

var CUSTOMER_COLLECTION = constants.CUSTOMER_COLLECTION;
var EVENT_COLLECTION = constants.EVENT_COLLECTION;
var RATING_COLLECTION = constants.RATING_COLLECTION;

module.exports = {

	customer : (req, res) => {
		if(req.method === 'GET'){
			getCustomer(req, res);
		} else if(req.method === 'POST'){
			insertCustomer(req, res);
		} else if(req.method === 'PUT'){
			updateCustomer(req, res);
		} else if(req.method === 'DELETE'){
			removeCustomer(req, res);
		} else {
			var msg = req.method + ' is not defined for ' + req.url;
			res.status(200).json({"status":"faliure", "message":msg})
		}
    },

    event : (req, res) => {
		if(req.method === 'POST'){
			getEvents1(req, res);
		} else {
			var msg = req.method + ' is not defined for ' + req.url;
			res.status(200).json({"status":"faliure", "message":msg})
		}
    },

    insertEvent : (req, res) => {
		if(req.method === 'POST'){
			insertEvent(req, res);
		} else {
			var msg = req.method + ' is not defined for ' + req.url;
			res.status(200).json({"status":"faliure", "message":msg})
		}
    },
    
    rating : (req, res) => {
        if(req.method === 'GET'){
			getRating(req, res);
		} else if(req.method === 'POST'){
			setRating(req, res);
		} else {
			var msg = req.method + ' is not defined for ' + req.url;
			res.status(200).json({"status":"faliure", "message":msg})
		}
    }
}

getRating = (req, res) => {
    var db = server.database;
    var cursor;
    if(req.headers['customerid']) {
        cursor = db.collection(RATING_COLLECTION).find({"customerid":req.headers['customerid']});
    } else {
        cursor = db.collection(RATING_COLLECTION).find();
    }
    var ratingJsonResponse = [];
    cursor.each(function(err, doc) {
        if(doc !== null) {
            ratingJsonResponse.push(doc);
        } else {
            res.status(200).json(ratingJsonResponse);
        }
    });
}

setRating = (req, res) => {
    if(Object.keys(req.body).length !== 0){
        var customerJson = req.body;
        var db = server.database;
        db.createCollection(RATING_COLLECTION, function(req, collection) {
            collection.insert(customerJson, function(err) {
                if (err) {
                    extensionMethods.handleError(res, err.message, "Failed to add rating data.");
                    return;
                } else {
                    res.status(200).send({"status":"success"});
                }
            });
        });
    } else {
        res.status(400).send({"status":"Request body not present"});
    }
}

getCustomer = (req, res) => {
    var db = server.database;
    var cursor;
    if(req.headers['customerid']) {
        cursor = db.collection(CUSTOMER_COLLECTION).find({"customerid":req.headers['customerid']});
    } else {
        cursor = db.collection(CUSTOMER_COLLECTION).find();
    }
    var employeeJsonResponse = [];
    cursor.each(function(err, doc) {
        if(doc !== null) {
            employeeJsonResponse.push(doc);
        } else {
            res.status(200).json(employeeJsonResponse);
        }
    });
}

insertCustomer = (req, res) => {
    if(Object.keys(req.body).length !== 0){
        var customerJson = req.body;
        var db = server.database;
        db.createCollection(CUSTOMER_COLLECTION, function(req, collection) {
            collection.insert(customerJson, function(err) {
                if (err) {
                    extensionMethods.handleError(res, err.message, "Failed to add customer data.");
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

getEvents = (req, res) => {
    // if(Object.keys(req.body).length !== 0){
    //     var customerJson = req.body;
        var db = server.database;
        var eventRes = [];
        var cursor = db.collection(EVENT_COLLECTION).find({"name":"Bangalore"});
        cursor.each(function(err, doc) {
            if(doc !== null) {
                // var innerCursor = db.collection(CUSTOMER_COLLECTION).find({"customerid":req.body.customerid});
                // innerCursor.each(function(err, innerdoc) {
                //     if(innerdoc !== null) {
                //         for(var i=0;i<doc.activities.length;i++){
                //             //config.authorizedTpxIDs.includes(afterAuthenticationTpxID)
                //             if(innerdoc.interests.includes(doc.category)) {
                //                 eventRes 
                //             }
                //         }
                //     }
                // });
                eventRes.push(doc.activities[0]);
            } else {
                res.send(eventRes[0]);
            }
        });
    // } else {
    //     res.status(400).json({"status":"failure", "message":"Request body not present"});
    // }
}

insertEvent = (req, res) => {
    if(Object.keys(req.body).length !== 0){
        var customerJson = req.body;
        var db = server.database;
        db.createCollection(EVENT_COLLECTION, function(req, collection) {
            collection.insert(customerJson, function(err) {
                if (err) {
                    extensionMethods.handleError(res, err.message, "Failed to add customer data.");
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

getEvents1 = (req, res) => {
    if(Object.keys(req.body).length !== 0){
        var customerJson = req.body;
        var db = server.database;
        var eventRes = [];
        var cursor = db.collection(EVENT_COLLECTION).find({"name":req.body.place});
        cursor.each(function(err, doc) {
            if(doc !== null) {
                var innerCursor = db.collection(CUSTOMER_COLLECTION).find({"customerid":req.body.customerid});
                innerCursor.each(function(err, innerdoc) {
                    if(innerdoc !== null) {
                        for(var i=0;i<doc.activities.length;i++){
                            //config.authorizedTpxIDs.includes(afterAuthenticationTpxID)
                            if(innerdoc.interests.includes(doc.activities[i].category.toLowerCase())) {
                                eventRes.push(doc.activities[i]);
                            }
                        }
                    } else {
                        res.status(200).json(eventRes);
                    }
                });
            }
        });
    } else {
        res.status(400).json({"status":"failure", "message":"Request body not present"});
    }
}
