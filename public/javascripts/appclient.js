var socket = io.connect();
var myapp = (function(){

	var test = function() {
		socket.emit('test_database', {});
	};

	socket.on('test database result', function() {
		jQuery('#people').empty();
		jQuery('#people').load('/test');

	});

    var changeUser = function() {
        var temp = $(this).text();
        console.log("changing user to: "+temp);
        socket.emit('Change User', {email:temp});
    };

    socket.on('Change User Success', function() {
        console.log("want to change page to wishlist");
        window.location.href = "/wishlist";
    });

    var selectRemoveUser = function() {
        var element = $(this);
        if(element.hasClass("selected")) {
            element.removeClass("selected");
        }else {
            element.addClass("selected");
        }
    }

    var removeUsers = function() {
        console.log("inside remove users");
        var users = [];
        $("#remove-table tr.selected td.email").each(function() {
            users.push($(this).text());
        });
       
        $.post("/remove-user", {users:users}, function(data) {
            console.log("post is done");
            alert(data);
            window.location = "/remove-user";
            return;
        });
    }

    var addItem = function() {
        console.log("add item");
        var parent = $(this).parent().parent().find("td.item");
        var upc = $(parent).find(".hidden").attr("value");
        var quant = $(parent).find(".quantity").prop("value");
        var event_id = $("#additem .hidden.id").attr("value");
        socket.emit("Add Item", {upc:upc, quant:quant, event_id:event_id});
    }

    socket.on('Added Item', function(req) {
        console.log("added item");
        console.log(req);
        console.log(req.alert);
        if(req.alert) {
            alert(req.alert);
        }
        window.location.href = "/wishlist";
    });

    var navSelect = function() {
        $(this).parent().addClass('active');
    };

    var addVendors = function() {
        var event_id = $(this).parent().parent().parent().find("input.event-list").attr("value");
        var email = $(this).parent().parent().parent().find("input#wanteremail").attr("value");
        console.log(event_id + " "+email);
        socket.emit("Get Vendors", {event_id:event_id, email:email});
    }

    socket.on("Vendors Finished", function(req) {
        var err = req.err;
        if(err) {
            alert(""+err);
            return;
        }else {
            var itemVendors = req.itemVendors;
            var event_id = req.event_id;
            for(var upc in itemVendors) {
                setVendorsLoop(itemVendors[upc], event_id, function() {});
            }
        }
    });

    var setPrice = function(event_id, itemVend, callback) {
        if(itemVend.discount) {
            console.log("price: "+itemVend.price);
            itemVend.price = (itemVend.price - (itemVend.price * 0.01 * itemVend.discount)).toFixed(2);
            $("div."+event_id+" td#price."+itemVend.upc).text(itemVend.price).css("color", "red");
        } else {
            $("div."+event_id+" td#price."+itemVend.upc).text(itemVend.price);
        }
        callback(); 
    };

    var setVendorsLoop = function(itemVends, event_id, callback) {
        for(i=0; i<itemVends.length; i++) {
            $("div."+event_id+" td#vendorlist."+itemVends[i].upc).load("/vendorList", {itemVends:itemVends, event_id:event_id});
            setPrice(event_id, itemVends[i], function() {});
            if(i==itemVends.length) callback();
        }   
    };

    var updatePrice = function() {
        console.log("updating price");
        var vid = $(this).find(":selected").attr("id");
        var upc = $(this).find(":selected").attr("class")
        var event_id = $(this).parent().parent().parent().attr("id");
        socket.emit("Get ItemVend", {vid:vid, upc:upc, event_id:event_id});
    };

    socket.on("Got ItemVend", function(req) {
        var data = req.data[0];
        var event_id = req.event_id;
        var upc = req.upc;
        var vid = req.vid;
        if(data.discount) {
            data.price = data.price - (data.price * data.discount);
            console.log("new discount: "+data.price);
            $("div."+event_id+" td#price."+upc).text(data.price).css("color", "red");
        } else {
            console.log("price: "+data.price);
            $("div."+event_id+" td#price."+upc).text(data.price).css("color", "black");
        }
    });

    
    return {
        init: function() {
            //console.log("Client-side app starting up")
            
			jQuery("#testbutton").click(test);
            jQuery("#Select-User a").click(changeUser);
            jQuery("#remove-table tr").click(selectRemoveUser);
            jQuery("button#remove-user").click(removeUsers);
            jQuery("#additem button").click(addItem);
            jQuery('#datepicker').datepicker();
            jQuery('a.event-link').click(addVendors);
            jQuery('.table').on('change', '#vendor-list', updatePrice);
            jQuery('#navbar a').filter(function() {
                return this.href == window.location;
            }).parent().addClass('active');
            jQuery("#navbar a.dropdown-toggle").click(navSelect);
            $(function() {
                $( "#from" ).datepicker({
                  defaultDate: "+1w",
                  minDate: "0",
                  dateFormat: "yy-mm-dd",
                  changeMonth: true,
                  numberOfMonths: 3,
                  onClose: function( selectedDate ) {
                    $( "#to" ).datepicker( "option", "minDate", selectedDate );
                  }
                });
                $( "#to" ).datepicker({
                  defaultDate: "+1w",
                  dateFormat: "yy-mm-dd",
                  changeMonth: true,
                  numberOfMonths: 3,
                  onClose: function( selectedDate ) {
                    $( "#from" ).datepicker( "option", "maxDate", selectedDate );
                  }
                });
              });
            jQuery("form#newaddress").validate({
                rules: {
                    a1: {
                        required: true,
                        minlength: 1
                    },
                    city: {
                        required: true,
                        minlength: 1
                    },
                    zip: {
                        required: true,
                        minlength: 5,
                        maxlength: 5,
                    }
                },
                errorPlacement: function(error, element) {
                    element.parent().after(error);
                }, 
                highlight: function(element) {
                    $("button#newAddress").attr("type", "");
                    $(element).removeClass('success').addClass('error');
                },
                success: function(label) {
                    $(label).remove();
                    if($("#newAddress input").hasClass("error") == false) {
                        $("button#newAddress").attr("type", "submit");
                    }
                }
            });

            jQuery("#newevent").validate({
                rules: {
                    e_name: {
                        minlength: 1,
                        required: true
                    },
                    from: {
                        required: true,
                        date: true
                    },
                    to: {
                        required: true,
                        date: true
                    }
                },
                errorPlacement: function(error, element) {
                    element.parent().after(error);
                }, 
                highlight: function(element) {
                    $("#newevent button").attr("type", "");
                    $(element).removeClass('success').addClass('error');
                },
                success: function(label) {
                    $(label).remove();
                    if($("#newevent input").hasClass("error") == false) {
                        $("#newevent button").attr("type", "submit");
                    }
                }
            });

            jQuery("#newuser-form").validate({
                rules: {
                    email1: {
                        minlength: 2,
                        required: true
                    },
                    email2: {
                        minlength: 4,
                        required: true
                    },
                    name: {
                        minlength: 1,
                        required: true
                    },
                    age: {
                        minlength: 1,
                        maxlength: 2,
                        required: true,
                        number: true
                    }
                },
                errorPlacement: function(error, element) {
                    element.parent().after(error);
                },
                highlight: function(element) {
                    $("#newuser-form button").attr("type", "");
                    $(element).removeClass('success').addClass('error');
                },
                success: function(label) {
                    $(label).remove();
                    if($("input").hasClass("error") == false) {
                        $("#newuser-form button").attr("type", "submit");
                    }
                }
            });
        }
    }
})();
jQuery(myapp.init);

