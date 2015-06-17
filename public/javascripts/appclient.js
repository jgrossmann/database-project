var socket = io.connect();
var myapp = (function(){

	var test = function() {
		socket.emit('test_database', {});
	}

	socket.on('test database result', function() {
		jQuery('#people').empty();
		jQuery('#people').load('/test');
	});

    return {
        init: function() {
            //console.log("Client-side app starting up")
			jQuery("#testbutton").click(test);
        }
    }
})();
jQuery(myapp.init);

