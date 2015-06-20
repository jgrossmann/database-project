var database = require('./database.js');
var async = require('async');

exports.index = function (req, res) {
    var user = "Select User";
    var phrase = "Wishlist";
    var users;
    database.getAllUsers(function(err, data) {
        if(err) {
            console.log(err);
            return;
        }
        if(data) {
            users = data;
            console.log("rendering index");
            res.render('index', {title: "Database Project", user:user, users:users, headerPhrase:phrase});
            return res;
        }
    });
};

function getUserData(otherCallBack) {
    async.parallel({
        users:   function(callback) {
                    database.getAllUsers(function(err, data) {
                        if(err || data === null) {
                            console.log(err);
                            callback(err, null);
                        }else {
                            callback(null, data);
                        }
                    });
                },
        
        user:   function(callback) {
                    database.getCurrentUser(function(err, data) {
                        if(err) {
                            console.log(err);
                            callback(err, null);
                        }else {
                            callback(null, data);                  
                        }
                    });
                }

    }, function(err, data) {
        if(err) {
            console.log("error getting user data");
            otherCallBack(err, null);
        }else {
            otherCallBack(null, data);
        }
    });
}

exports.wishlist = function(req, res) {
    var user;
    var phrase;
    var users;
    console.log("wishlist");
    getUserData(function(err, data) {
        if(err) {
            console.log(err);
            res.statusCode = 302;
            res.setHeader("Location", "/");
            res.end();
        }else {
            user = data.user.name;
            phrase = "Hello, "+user;
            users = data.users;
            res.render('wishlist', {title: "Database Project", user:user, users:users, headerPhrase:phrase});
        }
    });
}

exports.gift = function(req, res) {
    var user;
    var phrase;
    var users;
    console.log("wishlist");
    getUserData(function(err, data) {
        if(err) {
            console.log(err);
            res.statusCode = 302;
            res.setHeader("Location", "/");
            res.end();
        }else {
            user = data.user.name;
            phrase = "Hello, "+user;
            users = data.users;
            res.render('gift', {title: "Database Project", user:user, users:users, headerPhrase:phrase});
        }
    });
}

exports.settings = function(req, res) {
    var user;
    var phrase;
    var users;
    console.log("wishlist");
    getUserData(function(err, data) {
        if(err) {
            console.log(err);
            res.statusCode = 302;
            res.setHeader("Location", "/");
            res.end();
        }else {
            user = data.user.name;
            phrase = "Hello, "+user;
            users = data.users;
            res.render('settings', {title: "Database Project", user:user, users:users, headerPhrase:phrase});
        }
    });
}



exports.test = function(req, res) {
	var data = database.getTestData();
	res.render('people', {people:data});
}

/*database.getCurrentUser(function(err, data) {
    if(err) {
        console.log(err);
        return;
    }
    if(!err && (data === null || data === "" || data === [])) {
        user = "Select User";
    }else if(data) {
        user = data.name;
    }
});*/
