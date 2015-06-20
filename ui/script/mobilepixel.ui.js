/**
 * Created by Jim Ankrom on 6/9/2015.
 */
var connCfg = {
    delimit: '|',
    socketAddress: '192.168.1.8:8000'
};

// control
// TODO: Socket should just accept a cfg object of event handlers and configuration

var mobilePixel = (function (config) {

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
    conn.connect();

    return {
        conn: conn
    };
})(connCfg);

// cache all elements here
var elements = {
    body: document.getElementsByName('body')[0]
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