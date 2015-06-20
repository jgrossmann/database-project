var database = require('./database.js');

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

exports.wishlist = function(req, res) {
    var user;
    var phrase;
    var users;
    console.log("wishlist");
    database.getCurrentUser(function(err, data) {
        if(err) {
            console.log(err);
            res.statusCode = 302;
            res.setHeader("Location", "/");
            res.end();
            return;
        }
        if(data) {
            console.log("data");
            user = data.name;
            phrase = "Hello, "+user;
            database.getAllUsers(function(err, data) {
                if(err) {
                    console.log(err);
                    return;
                }
                if(data) {
                    users = data;
                    console.log("rendering wishlist for "+user.name);
                    res.render('wishlist', {title: "Database Project", user:user, users:users, headerPhrase:phrase});
                    return res;
                }
            });
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
