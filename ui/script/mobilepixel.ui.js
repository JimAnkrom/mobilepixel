/**
 * Created by Jim Ankrom on 6/9/2015.
 */
var connCfg = {
    delimit: '|',
    socketAddress: '192.168.1.7:8000'
};

// control
// TODO: Socket should just accept a cfg object of event handlers and configuration

var mobilePixel = (function (config) {
    function _onMessage (msg) {
        var message = JSON.parse(msg);
        var action = pixel.actions[message.name];
        if (action) {
            action(message.options);
        }
    }

    //var conn = new sway.Socket({
    //    onMessage: function (message) {
    //        // determine what actions are available
    //        var action = pixel.actions[message.action];
    //        if (action) {
    //            action(message.params);
    //        }
    //    }
    //});

    var conn = new sway.Socket(connCfg);
    conn.onMessage.add(_onMessage);
    //conn.connect();

    return {
        conn: conn
    };
})(connCfg);

// cache all elements here
var elements = {
};

// pixel actions
var pixel = {
    actions: {
        setColor: function (params) {
            elements.body.style.backgroundColor = params.color;
        },
        setImage: function () {},
        transition: function (params) {
            // move from one color to the next via certain parameters

        },
        drawSquare: function () {},
        animatedStar: function () {},
        takePhoto: function () {
            // should upload the photo to the server
        },
        // last priority
        recordAudio: function () {}
        // blink
    }
    // animate
    //
};

window.onload = function () {
    elements.body = document.body;
    mobilePixel.conn.connect();
};
