var database = require('./database.js');
var async = require('async');
var util = require('util');

exports.index = function (req, res) {
    var user = "Select User";
    var phrase = "Wishlist";
    var users;
    console.log("getting index");
    database.getAllUsers(function(err, data) {
        if(err) {
            console.log(err);
            return;
        }
        if(data) {
            users = data;
            console.log("rendering index");
            res.render('index', {title: "Database Project", user:user, users:users, headerPhrase:phrase, home:true, alert:req.flash("alert")});
            return res;
        }
    });
};

function getUserData(otherCallBack) {
    async.parallel({
        users:   function(callback) {
                    database.getAllUsers(function(err, data) {
                        if(err) {
                            callback(err, null);
                            return;
                        }else {
                            callback(null, data);
                            return;
                        }
                    });
                },
        
        user:   function(callback) {
                    database.getCurrentUser(function(err, data) {
                        if(err) {
                            callback(err, null);
                            return;
                        }else {
                            callback(null, data); 
                            return;                 
                        }
                    });
                }

    }, function(err, data) {
        if(err) {
            otherCallBack(err, null);
            return;
        }else {
            otherCallBack(null, data);
            return;
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
            return;
        }else {
            user = data.user.name;
            phrase = "Hello, "+user;
            users = data.users;
            var eventItems = {};
            var events;
            database.getUserEvents(data.user.email, function(err, eventsData) {
                if(err) {
                    console.log(err);
                    req.flash("alert", ""+err);
                    res.redirect("/");
                }else {
                    var error = null;
                    var events = eventsData;
                    console.log(events);
                    for(i=0; i<events.length; i++) {
                        var event = events[i];
                        var id = event.event_id;
                        console.log(id);
                        console.log("event "+i+" "+util.inspect(event, false, null));
                        database.getEventItems(id, function(err, items) {
                            if(err) {
                                if(error) {
                                    error = error + "\n"+err;
                                }else {
                                    error = ""+err;
                                }
                            }else {
                                console.log(items);
                                console.log("events i: "+util.inspect(event, false, null));
                                eventItems[id] = items;
                                if(i == events.length) {
                                    console.log("if statement end: "+util.inspect(eventItems, false, null));
                                    res.render('wishlist', {title: "Database Project", user:user, users:users, headerPhrase:phrase, alert:error, events:events, eventItems:eventItems});
                                }
                            }                     
                        });
                    }            
                }
            });
            
            return;
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
    
}

exports.newUser = function(req, res) {
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
            console.log("rendering new user");
            res.render('newUser', {title: "Database Project", user:user, users:users, headerPhrase:phrase, newuser:true, alert:req.flash("alert")});
            return res;
        }
    });
}

exports.createNewUser = function(req, res) {
    database.createNewUser(req.body, function(err, data) {
        if(err) {
            console.log(err);
            req.flash("alert", ""+err);
            res.redirect("/new-user");
            return res;
        }else {
            console.log("success");
            req.flash("alert", "User Successfully Created!");
            res.redirect("/new-user");
            return res;
        }
    });
}

exports.removeUser = function(req, res) {
    var user = "Select User";
    var phrase = "Wishlist";
    var users;var user;
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
            //res.render('settings', {title: "Database Project", user:user, users:users, headerPhrase:phrase});
        }
    });
    database.getAllUsers(function(err, data) {
        if(err) {
            console.log(err);
            return;
        }
        if(data) {
            users = data;
            console.log("rendering new user");
            res.render('removeUser', {title: "Database Project", user:user, users:users, headerPhrase:phrase, removeuser:true, alert:req.flash("alert")});
            return res;
        }
    });
}

exports.deleteUsers = function(req, res) {
    database.removeUsers(req.body.users, function(err) {
        if(err) {
            console.log(err);
            res.end(""+err);
            return res;
        }else {
            console.log("success");
            res.end("Users Successfully Removed!");
            return res;
        }
    });
}

exports.addItem = function(req, res) {
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
            database.getAllItems(function(err, items) {
                if(err) {
                    console.log(err);
                    req.flash("alert", ""+err);
                    res.redirect("/wishlist");
                } else {
                    res.render('additem', {title: "Database Project", user:user, users:users, headerPhrase:phrase, items:items});
                    return;
                }
            });           
        }
    });
}

exports.test = function(req, res) {
	var data = database.getTestData();
	res.render('people', {people:data});
}


