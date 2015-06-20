
var debug = true;

var fpsToMs = {
    60: 16,
    30: 33,
    15: 66
};

// generates a frame buffer - array of actions per # of devices
function bufferActions(sequence, deviceCount) {
    var frames = [],
        d, a, action, actionCount = sequence.length;

    for (a=0; a < actionCount; a++) {
        action = sequence[a];
        var frame = [];

        for (d = 0; d < deviceCount; d++) {
            frame.push(action);
        }
        frames.push(frame);
    }
    if (debug) console.log(deviceCount + ' Frameset: ' + JSON.stringify(frames));

    return frames;
}



// TODO: sequence.getNext - gets next frame
module.exports = (function () {
    var socketServer;

    var actionSequence = [
        { interval: 1000, action: "setColor", params: {color: "red"}},
        { interval: 1000, action: "setColor", params: {color: "blue"}},
        { interval: 1000, action: "setColor", params: {color: "green"}}
    ];

    var frameBuffer = _refreshAnimation(1);
    var currentFrame = 0;
    var timeoutHandle;

    function _eachClient(callback) {
        var keys = Object.keys(socketServer.clients), i, key, keyCount;

        keyCount = keys.length;
        if (debug) console.log('Executing callback for ' + keyCount + ' clients');

        for (i=0; i < keyCount; i++) {
            key = keys[i];
            if (debug) console.log('Executing callback for ' + key);
            callback(socketServer.clients[key], i);
        }
    }

    function _refreshAnimation (deviceCount) {
        frameBuffer = bufferActions(actionSequence, deviceCount);
        return frameBuffer;
    }

    function _sendFrame (frame) {
        // iterate over the server clients, send frame action
        _eachClient(function (client, index) {
            var action = frame[index];
            if (action) {
                client.send(JSON.stringify(action));
                if (debug) console.log('Frame sent to device ' + index);
            } else {
                if (debug) console.log('Action not found ' + index);
            }
        });
        if (debug) console.log('Executing sendFrame');

    }

    function _sendNext () {
        var frame = frameBuffer[currentFrame];
        if (frame) {
            if (debug) console.log('Sending frame ' + JSON.stringify(frame));
            _sendFrame(frame);
        } else {
            if (debug) console.log('Frame not found ' + currentFrame);
        }

        var currentAction = actionSequence[currentFrame];
        // get the next frame, send it
        if (currentFrame < frameBuffer.length - 1) {
            currentFrame++;
        } else {
            currentFrame = 0;
        }
        // and set a timeout when to call this next
        timeoutHandle = setTimeout(_sendNext, currentAction.interval);
    }

    return {
        setServer: function (server) {
            if (!socketServer) {
                //if (debug) console.log('Setting server to controller...');
                socketServer = server;
                _sendNext();
            }
        },
        refresh: _refreshAnimation,
        sendFrame: _sendFrame
    };
})();