var async = require('async');
var next_anonymous = 1; 
var HOME = __dirname+"/../";
var util = require("util");
var encode = require("hashcode").hashCode;

var mysql = require('mysql');
var db = mysql.createConnection({
	host : 'cs4111.cyiqnfca9p2n.us-west-2.rds.amazonaws.com',
	user : 'dhc2131',
	password: '4111database',
	database: 'cs4111',
});

var currentUser = null;
var allPeople = [];
var testData = "";
var temp = "";



function Person(email, name, age) {
    this.email = email;
    this.name = name;
    this.age = age;
}

function Want(email, upc, event_id, quant) {
    this.email = email;
    this.upc = upc;
    this.event_id = event_id;
    this.quant = quant;
}

function Event(email, e_name, date_start, date_end) {
    this.email = email;
    this.e_name = e_name;
    this.date_start = date_start;
    this.date_end = date_end;
}

function Friendship(wanter, gifter) {
    this.wanter = wanter;
    this.gifter = gifter;
}


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

var getAllUsers = function(callback) {
    var users = null;
    console.log("database: getting users");
    console.log("current user: "+currentUser);
    db.query('SELECT * from Person', function(err, rows, fields) {
        console.log('query complete');
		if (err) {
            console.log('Error while performing Query.');
            callback(err, null);
            return;
		} else {
            console.log("success");
			callback(null, rows);
            return;
		}
	});
}
exports.getAllUsers = getAllUsers;


var getCurrentUser = function(callback) {
    if(currentUser === null) {
        console.log("getCurrentUser: no current user");
        callback(new Error("no current user"), null);
    }else {
        callback(null, currentUser);
        return;
    }
}
exports.getCurrentUser = getCurrentUser;

var setCurrentUser = function(req) {
    var newEmail = req.data.email;
    var allUsers = getAllUsers(function(err, data) {
        if(err) {
            console.log(err);
            return;
        }else{
            for(i=0; i<data.length; i++) {
                if(newEmail === data[i].email) {
                    currentUser = data[i];
                    console.log("set the new user to "+newEmail);
                    req.io.emit("Change User Success");
                    return;
                }
            }
        }

    });
   
    
}
exports.setCurrentUser = setCurrentUser;

var createNewUser = function(req, callback) {
    var user = new Person(req.email1+"@"+req.email2, req.name, req.age);
    db.query('INSERT INTO Person set ?', user, function(err, rows) {
		if (err) {
            console.log(err);
            callback(err, null);
		} else {
            console.log(rows);
            callback(null, rows);
		}
	});
}
exports.createNewUser = createNewUser;

var removeUsers = function(data, callback) {
    var error = null;
    for(i=0; i<data.length; i++) {
        db.query('DELETE FROM Person where email = ?', data[i], function(err, rows) {
            if (err) {
                console.log(err);
                if(error != null) {
                    error = error + "\n"+err;
                }else {
                    error = ""+err;
                }
                /*if(i === (data.length - 1)) {
                    callback(error, null);
                    return;
                }*/
		    } else {
                /*if(i === (data.length - 1)) {
                    callback(error, rows);
                    return;
                }*/
		    }
        });
    }
    if(i == data.length) {
        callback(error);
    }
}   
exports.removeUsers = removeUsers;

var getUserEvents = function(email, callback) {
    console.log("getting user events");
    db.query('Select * FROM Event WHERE email = ?', email, function(err, rows) {
        if (err) {
            console.log('Error while performing Query.');
            callback(err, null);
            return;
            
		} else {
            console.log("events no error");
			callback(null, rows, email);
            return;
		}
    });
}
exports.getUserEvents = getUserEvents;

var getEventItems = function(eventId, callback) {
    db.query('Select * FROM wants W, Item I WHERE W.upc = I.upc AND W.event_id = ?', eventId, function(err, rows) {
        if (err) {
            console.log('Error while performing Query.');
            callback(err, null, null);
            return;
            
		} else {
			callback(null, rows, eventId);
            return;
		}
    });
}
exports.getEventItems = getEventItems;

var getAllItems = function(callback) {
    db.query('Select * FROM Item', function(err, rows) {
        if(err) {
            console.log('Error while performing query');
            callback(err, null);
            return;
        } else {
            callback(null, rows);
            return;
        }
    });
}
exports.getAllItems = getAllItems;

var addItem = function(req) {
    var want = new Want(currentUser.email, req.data.upc, req.data.event_id, req.data.quant);
    var upc = req.data.upc;
    var quant = req.data.quant;
    var event_id = req.data.event_id;
    console.log(want);
    if(event_id == null) {
        console.log("No event_id so this will go under general");
    }
    if(upc == null || quant == null || currentUser.email == null) {
        req.io.emit('Added Item', {alert:"One or more of the required fields is null"});
        return;
    }else {
        db.query('INSERT INTO wants set ?', want, function(err, rows) {
            if(err) {
                console.log('Query Error');
                req.io.emit('Added Item', {alert:""+err});
            }else {
                req.io.emit('Added Item', {});
            }
        });
    }
}
exports.addItem = addItem;

var getUserGeneralItems = function(email, callback) {
    db.query('SELECT * FROM Item I, wants W WHERE I.upc = W.upc AND W.event_id IS NULL AND W.email = ?', email, function(err, rows) {
        if(err) {
            console.log(err);
            callback(err, null);
        }else {
            callback(null, rows, email);
        }
    });
}
exports.getUserGeneralItems = getUserGeneralItems;

var removeItem = function(upc, callback) {
    var email = currentUser.email;
    db.query('DELETE FROM wants WHERE email = ? AND upc = ?', [email, upc], function(err, rows) {
        if(err) {
            console.log(err);
            callback(err, null);
        }else {
            callback(null, rows);
        }
    });
}
exports.removeItem = removeItem;

var newEvent = function(e_name, start_date, end_date, callback) {
    var email = currentUser.email;
    var event = new Event(email, e_name, start_date, end_date);
    if(e_name == null || start_date == null || end_date == null || email == null) {
        console.log("a value to new event is null");
        callback("A value to new event is null");
    }else {
        db.query('INSERT INTO Event set ?', event, function(err, rows) {
            if(err) {
                console.log(err);
                callback(err, null);
            }else {
                callback(null, rows);
            }
        });
    }
}
exports.newEvent = newEvent;

var getFriends = function(callback) {
    var email = currentUser.email;
    db.query('SELECT P.name, P.email FROM is_friend F, Person P WHERE F.wanter = P.email AND F.gifter = ?', email, function(err, rows) {
        if(err) {
            console.log(err);
            callback(err, null);
        }else {
            callback(null, rows);
        }
    });
}
exports.getFriends = getFriends;

var getNonFriends = function(callback) {
    var email = currentUser.email;
    db.query('SELECT P.name, P.email FROM Person P WHERE P.email NOT IN (SELECT P1.email FROM Person P1, is_friend F WHERE F.wanter = P1.email AND F.gifter = ?) AND P.email != ?', [email, email], function(err, rows) {
        if(err) {
            console.log(err);
            callback(err, null);
        }else {
            callback(null, rows);
        }
    });
}
exports.getNonFriends = getNonFriends;

var addFriend = function(wanter, callback) {
    var gifter = currentUser.email;
    var friendship = new Friendship(wanter, gifter);
    db.query('INSERT INTO is_friend set ?', friendship, function(err, rows) {
        if(err) {
            console.log(err);
            callback(err, null);
        }else {
            callback(null, rows);
        }
    });
}
exports.addFriend = addFriend;

var removeFriend = function(wanter, callback) {
    var gifter = currentUser.email;
    db.query('DELETE FROM is_friend WHERE wanter = ? AND gifter = ?', [wanter, gifter], function(err, rows) {
        if(err) {
            console.log(err);
            callback(err, null);
        }else {
            callback(null, rows);
        }
    });
}
exports.removeFriend = removeFriend;


var getFriendData = function(otherCallBack) {
    async.waterfall([
        function(callback) {
            getFriends(function(err, friends) {
                if(err) {
                    callback(err, null);
                }else {
                    console.log(friends);
                    callback(null, friends);
                }
            });
        },
    
        function(friends, callback) {
            console.log("friends in 2: "+friends);
            var friendEventItems= {};
            var friendHash = {};
            var eventHash = {};
            async.forEach(friends, function(friend, callback) {
                friend.hash = encode().value(friend.email);
                friendHash[friend.email] = {name: friend.name, hash: friend.hash};
                getUserGeneralItems(friend.email, function(err, items) {
                    friendEventItems[friend.email] = {};
                    if(err) {
                        callback(err);
                    }else {
                        friendEventItems[friend.email].General = items;
                        eventHash.General = 'General';
                        console.log("Got general items: "+items);
                        getUserEvents(friend.email, function(err, events) {
                            if(err) {
                                callback(err);
                            }else {
                                async.forEach(events, function(event, callback) {
                                    getEventItems(event.event_id, function(err, items) {
                                        if(err) {
                                            callback(err);
                                        }else {
                                            console.log("got event items: "+items);
                                            eventHash[event.event_id] = event.e_name;
                                            friendEventItems[friend.email][event.event_id] = items;
                                            callback();
                                        }
                                    });
                                }, function(err) {
                                    if(err) {
                                        callback(err);
                                    }else {
                                        callback();
                                    }
                                });
                            }
                        });
                    }
                });
            }, function(err) {
                if(err) {
                    callback(err);
                }else {
                    callback(null, friendEventItems, friendHash, eventHash);
                }
            });
        }
    ], function(err, friendEventItems, friendHash, eventHash) {
            console.log(util.inspect(friendEventItems, false, null));
            if(err) {
                console.log(err);
            }
            otherCallBack(err, friendEventItems, friendHash, eventHash);
        });
}
exports.getFriendData = getFriendData;

var getFriendEmailHash = function(callback) {
    friendHash = {};
    getFriends(function(err, friends) {
        if(err) {
            console.log(err);
            callback(err, null);
        }else {
            async.forEach(friends, function(friend, callback) {
                
                callback();
            }, function(err) {
                console.log(util.inspect(friendHash, false, null));
                callback(null, friendHash);
            });
        }
    });
}
exports.getFriendEmailHash = getFriendEmailHash;


                    
                        

