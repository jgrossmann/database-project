var socket = io.connect();
var myapp = (function(){

	var test = function() {
		socket.emit('test_database', {});
	}

	socket.on('test database result', function() {
		jQuery('#people').load('/test');
	});

    var submit = function() {
        socket.emit('recommend', {number:jQuery('#number').val(), id:jQuery('#recomuserid').val()});
    };

    socket.on('recommend_done', function() {
            jQuery('#recommendations').load('/recommendations');
    });


    var submit_track = function() {
        socket.emit('add_preference', {track:jQuery('#track').val(), trackid:jQuery('#trackuserid').val(),
                                        longitude:jQuery('#longitude').val(), latitude:jQuery('#latitude').val()});
    };

    socket.on('preference_added', function() {
        jQuery('#addin').load('/addin');
    });


    return {
        init: function() {
            //console.log("Client-side app starting up")
            jQuery("#submit").click(submit);
            jQuery("#submittrack").click(submit_track);
			jQuery("#testbutton").click(test);
			

        }
    }
})();
jQuery(myapp.init);

