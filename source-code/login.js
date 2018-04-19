var server = require('./server');
var constants = require('../constants');
var extensionMethods = require('./extensionMethods');
var config = require('../config.json');

var CUSTOMER_COLLECTION = constants.CUSTOMER_COLLECTION;

module.exports = {

	login: function(req, res) {
		db.collection(EMPLOYEES_COLLECTION).count({"tpxID":tpxID}, function(countErr, empCount){
			if(countErr){
				extensionMethods.handleError(res, countErr.message, "Employee Count Error");
			} else {
				if(empCount > 0){
				}
			}
		});
	}
}
