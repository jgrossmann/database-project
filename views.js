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
                    eventsData = [];
                }
                var error = null;
                var events = eventsData;
                if(events == null) events = [];

                database.getUserGeneralItems(data.user.email, function(err, genItems) {
                    if(err) {
                        console.log(err);
                        req.flash("alert", ""+err);
                    }
                    eventItems.general = genItems;
                    if(events.length == 0) {
                        console.log("no events");
                        res.render('wishlist', {title: "Database Project", user:user, users:users, headerPhrase:phrase, alert:error, events:events, eventItems:eventItems, alert:req.flash("alert")});
                        return;
                    }
                    for(i=0; i<events.length; i++) {
                        database.getEventItems(events[i].event_id, function(err, items, id) {
                            if(err) {
                                console.log(err);
                                if(error) {
                                    error = error + "\n"+err;
                                }else {
                                    error = ""+err;
                                }
                                eventItems[id] = [];
                            }else {
                                if(items == null) items = [];
                                console.log("id "+id+" items: "+items);
                                eventItems[id] = items;
                                if(id == events[events.length-1].event_id) {
                                    res.render('wishlist', {title: "Database Project", user:user, users:users, headerPhrase:phrase, alert:error, events:events, eventItems:eventItems, alert:req.flash("alert")});
                                }
                            }                     
                        });
                    }     
                });
                       
            });
            
            return;
        }
    });
}

exports.gift = function(req, res) {
    var user;
    var phrase;
    var users;
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
            database.getFriendData(function(err, friendEventItems, friendHash, eventHash) {
                if(err) {
                    console.log(err);
                    req.flash("alert", ""+err);
                    res.redirect("/");
                }else {
                    res.render('gift', {title: "Database Project", user:user, users:users, friendEventItems:friendEventItems, 
                                                friendHash:friendHash, eventHash:eventHash, headerPhrase:phrase, alert:req.flash("alert")}); 
                }             
            });
            
        }
    });
}

exports.settings = function(req, res) {
    var user;
    var phrase;
    var users;
    getUserData(function(err, data) {
        if(err) {
            console.log(err);
            res.redirect("/");
            return;
        }else{
            user = data.user.name;
            phrase = "Hello, "+user;
            users = data.users;
            res.render('settings', {title: "Database Project", user:user, users:users, headerPhrase:phrase, alert:req.flash("alert")});
            return res;
        }
    });    
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
    var event_id = req.body.event_id;
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
                    res.render('additem', {title: "Database Project", user:user, users:users, headerPhrase:phrase, items:items, event_id:event_id});
                    return;
                }
            });           
        }
    });
}

exports.removeItem = function(req, res) {
    var upc = req.body.upc;
    database.removeItem(null, upc, function(err, data) {
        if(err) {
            req.flash("alert", ""+err);
            res.redirect("/wishlist");
        }else {
            req.flash("alert", "Successfully Removed Item");
            res.redirect("/wishlist");
        }  
    });
}

exports.newEvent = function(req, res) {
    var e_name = req.body.e_name;
    var start_date = req.body.from;
    var end_date = req.body.to;
    
    database.newEvent(e_name, start_date, end_date, function(err, data) {
        if(err) {
            req.flash("alert", ""+err);
            res.redirect("/wishlist");
        }else {
            req.flash("alert", "Successfully Added an event");
            res.redirect("/wishlist");
        }
    });
}

exports.friends = function(req, res) {
    var user;
    var phrase;
    var users;
    getUserData(function(err, data) {
        if(err) {
            console.log(err);
            res.redirect("/");
            return;
        }else{
            user = data.user.name;
            phrase = "Hello, "+user;
            users = data.users;
            database.getFriends(function(err, friends) {
                if(err) {
                    console.log(err);
                    req.flash("alert", ""+err);
                    res.redirect("/settings");
                }else {
                    console.log(friends);
                    if(friends == null) friends = [];
                    res.render('friends', {title: "Database Project", user:user, users:users, friends:friends, headerPhrase:phrase, alert:req.flash("alert")});
                }
            });
        }
    });
}

exports.addFriendIndex = function(req, res) {
    var user;
    var phrase;
    var users;
    getUserData(function(err, data) {
        if(err) {
            console.log(err);
            res.redirect("/");
            return;
        }else{
            user = data.user.name;
            phrase = "Hello, "+user;
            users = data.users;
            database.getNonFriends(function(err, people) {
                if(err) {
                    console.log(err);
                    req.flash("alert", ""+err);
                    res.redirect("/friends");
                }else {
                    console.log(people);
                    if(people == null) people = [];
                    res.render('addfriend', {title: "Database Project", user:user, users:users, people:people, headerPhrase:phrase, alert:req.flash("alert")});
                }
            });
        }
    });
}

exports.addFriend = function(req, res) {
    var wanter = req.body.email;
    database.addFriend(wanter, function(err, data) {
        if(err) {
            console.log(err);
            req.flash("alert", ""+err);
            res.redirect("/friends");
        }else {
            req.flash("alert", "Successfully Added Friend");
            res.redirect("/friends");
        }
    });
    
}

exports.removeFriend = function(req, res) {
    var wanter = req.body.email;
    database.removeFriend(wanter, function(err, data) {
        if(err) {
            console.log(err);
            req.flash("alert", ""+err);
            res.redirect("/friends");
        }else {
            req.flash("alert", "Successfully Removed Friend");
            res.redirect("/friends");
        }
    });
}   

exports.giftItem = function(req, res) {
    console.log(req.body);
    var wanter = req.body.email;
    var upc = req.body.upc;
    var event_id = req.body.event_id;
    var quantity = req.body.quantity;
    var wantQuantity = req.body.wantQuantity;
    var min_age = req.body.min_age;
    if(event_id == "General") {
        event_id = null;
    }
    database.updateWant(wanter, upc, event_id, quantity, wantQuantity, min_age, function(err) {
        if(err) {
            console.log(err);
            req.flash("alert", ""+err);
            res.redirect("/gift");
        }else {
            req.flash("alert", "Successfully purchased gift");
            res.redirect("/gift");
        }
    });
};

exports.getVendorList = function(req, res) {
    var itemVends = req.body.itemVends;
    var event_id = req.body.event_id;
    res.render("vendorlist", {vendors:itemVends, event_id:event_id});
};

exports.getOrderHistory = function(req, res) {
    var user;
    var phrase;
    var users;
    getUserData(function(err, data) {
        if(err) {
            console.log(err);
            res.redirect("/");
            return;
        }else{
            user = data.user.name;
            phrase = "Hello, "+user;
            users = data.users;
            database.getOrderHistory(function(err, orders) {
                if(err) {
                    console.log(err);
                    req.flash("alert", ""+err);
                    res.redirect("/settings");
                }else {
                    res.render('orderhistory', {title: "Database Project", user:user, users:users, orders:orders, headerPhrase:phrase, alert:req.flash("alert")});
                }
            });
        }
    });      
}

exports.getShippingAddresses = function(req, res) {
    var user;
    var phrase;
    var users;
    var states = new Array("AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID", "IL","IN","KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY", "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY");
    getUserData(function(err, data) {
        if(err) {
            console.log(err);
            res.redirect("/");
            return;
        }else{
            user = data.user.name;
            phrase = "Hello, "+user;
            users = data.users;
            database.getShippingAddresses(function(err, addresses) {
                if(err) {
                    console.log(err);
                    res.redirect("/settings");
                }else {
                    console.log(addresses);
                    res.render('shipping-addresses', {title: "Database Project", user:user, users:users, addresses:addresses, states:states, headerPhrase:phrase, alert:req.flash("alert")});
                }
            });
        }
    });      
}

exports.removeAddress = function(req, res) {
    database.removeAddress(req.body.a1, req.body.a2, req.body.city, req.body.state, req.body.zip, function(err) {
        if(err) {
            console.log(err);
            req.flash("alert", ""+err);
            res.redirect("/shippingAddresses");
        }else {
            req.flash("alert", "Successfully removed Address");
            res.redirect("/shippingAddresses");
        }
    });
}

exports.addAddress = function(req, res) {
    database.addAddress(req.body.a1, req.body.a2, req.body.city, req.body.state, req.body.zip, function(err) {
        if(err) {
            console.log(err);
            req.flash("alert", ""+err);
            res.redirect("/shippingAddresses");
        }else {
            req.flash("alert", "Successfully Added Address");
            res.redirect("/shippingAddresses");
        }
    }); 
}

exports.getPaymentMethods = function(req, res) {
    res.redirect("/settings");
}

