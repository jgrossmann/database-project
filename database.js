var userhash = { };
var next_anonymous = 1; 
var HOME = __dirname+"/../";

var mysql = require('mysql');
var db = mysql.createConnection({
	host : 'cs4111.cyiqnfca9p2n.us-west-2.rds.amazonaws.com',
	user : 'dhc2131',
	password: '4111database',
	database: 'cs4111',
});

var testData = "";

var test_database = function(req) {
	//db.connect();

	db.query('SELECT * from Person', function(err, rows, fields) {
		if (!err) {
			console.log('Database fields: ', fields);
			testData = "";
			for(i=0; i<rows.length; i++) {
				testData += "Email: "+rows[i].email+"\tName: "+rows[i].name+"\tAge: "+rows[i].age+"\n";
			}
			req.io.emit("test database result");
		} else {
			console.log('Error while performing Query.');
		}
	});
	
	//db.end();
	
};
exports.test_database = test_database;

var getTestData = function(req) {
	return testData
};
exports.getTestData = getTestData;


