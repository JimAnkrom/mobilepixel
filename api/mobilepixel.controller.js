
var debug = false;

var fpsToMs = {
    60: 16,
    30: 33,
    15: 66
};

//// generates a frame buffer - array of actions per # of devices
//function bufferActions(sequence, deviceCount) {
//    var frames = [],
//        d, a, action, actionCount = sequence.length;
//
//    for (a=0; a < actionCount; a++) {
//        action = sequence[a];
//        var frame = [];
//
//        for (d = 0; d < deviceCount; d++) {
//            frame.push(action);
//        }
//        frames.push(frame);
//    }
//    if (debug) console.log(deviceCount + ' Frameset: ' + JSON.stringify(frames));
//
//    return frames;
//}

module.exports = (function () {
    var socketServer;
    // TODO: client connections - randomize to channels, or round-robin, or... ?

    // "Compile" a grid sequence into channel-based 'frames'
    // a frame is an array of actions for each channel
    function compilePattern(pattern) {
        var i, j, k, barCount, seqCount, stepCount;
        var BAR_STEP_COUNT = 16,
            bar, sequence, step, frame, action, channel, stepOffset, offsetStep;
        var temp = {
            length: 0,
            frames: {}
        };

        // for each bar in bars
        barCount = pattern.length;
        temp.length = barCount * BAR_STEP_COUNT;
        for (i=0; i<barCount; i++) {
            bar = pattern[i];
            stepOffset = i * BAR_STEP_COUNT;
            seqCount = bar.sequences.length;
            // each sequence in sequences
            for (j=0; j<seqCount; j++) {
                sequence = bar.sequences[j];
                // each step in (array of steps)
                stepCount = sequence.length;
                for (k=0; k<stepCount; k++) {
                    step = sequence[k];
                    offsetStep = step.step + stepOffset;
                    // TODO: you MUST have a frame for each step/tick, even if it's empty
                    // TODO: fix above requirement to have a frame... so you don't have to

                    // fixme: When we reset bars, the steps all reset to 1-16

                    // find or add a frame to output
                    frame = temp.frames[offsetStep];
                    if (!frame) {
                        frame = {};
                        temp.frames[offsetStep] = frame;
                    }
                    //var action = step.action;
                    //action.l = step.length;
                    // copy info from step into frame, and stringify it

                    // TODO: Potential bug here!!! Need to ensure that bar.sequences ALWAYS has the same number of sequence data items
                    // because we are using j - the sequence index - as the sequence ID, and hence, the "channel".
                    // NOTE: You DO NOT need to have channel data within a frame - ONLY if you're sending something to that channel!
                    // TODO: allow sequence to have a channel id? Or re-map the channel later?

                    var frameItem = JSON.stringify({
                        l: step.length,
                        t: step.type,
                        o: step.options
                    });
                    frame[j] = frameItem;
                    //if (!frame.length) {
                    //    frame.length = 1
                    //} else {
                    //    frame.length++;
                    //}
                }
            }
        }

        // TODO: Convert temp.frames and frame data into actual arrays - or perf test the assoc. array idea

        return temp;
    }

    // TODO: Compress the pattern for lower latency (send less bytes)
    function compressPattern () {}

    //var actionSequence = [
    //    { interval: 1000, action: "setColor", params: {color: "#FF0000" }},
    //    //{ interval: 1300, action: "tween", params: { interval: 1300, backgroundColor: "#FF0000" } },
    //    //{ interval: 1300, action: "tween", params: { interval: 1300, backgroundColor: "#0000FF" } },
    //    //{ interval: 1300, action: "tween", params: { interval: 1300, backgroundColor: "#00FF00" } } //,
    //    { interval: 1000, action: "setColor", params: {color: "blue"}},
    //    { interval: 1000, action: "setColor", params: {color: "green"}}
    //];

    // sequence.frames[frame][channel]
    var activeSequence = {
        frames: [
            {
                step: 0,
                0: '{"l":4,"t":"setColor","o":{"color":"#FF0000"}}',
                1: '{"l":4,"t":"setColor","o":{"color":"#FFFF00"}}',
                2: '{"l":4,"t":"setColor","o":{"color":"#FF00FF"}}',
                3: '{"l":4,"t":"setColor","o":{"color":"#FF0000"}}'
            },
            {
                step: 1,
                0: '{"l":4,"t":"setColor","o":{"color":"#FF33FF"}}',
                1: '{"l":4,"t":"setColor","o":{"color":"#FFFFFF"}}',
                2: '{"l":4,"t":"setColor","o":{"color":"#FF0000"}}',
                3: '{"l":4,"t":"setColor","o":{"color":"#FF00FF"}}'
            }
        ]
    };

    var frameBuffer = _refreshAnimation(1),
        nextSequence,
        currentFrame = 0,
        timeoutHandle,
        clock = {
            interval: 500
        };

    function _setPattern(pattern) {
        nextSequence = compilePattern(pattern);
        // TODO: when the current sequence completes, load this
    }


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

    // TODO: consider how this is used... commented because we no longer need this
    function _refreshAnimation (deviceCount) {
    //    frameBuffer = bufferActions(activeSequence, deviceCount);
    //    return frameBuffer;
    }

    function _sendFrame (frame) {
        // iterate over the server clients, send frame action
        _eachClient(function (client, index) {
            var action = frame[index];
            if (action) {
                client.send(action);
                if (debug) console.log('Frame sent to device ' + index);
            } else {
                if (debug) console.log('Action not found ' + index);
            }
        });
        if (debug) console.log('Executing sendFrame')
    }

    var nextFrame;
    function _sendNext () {
        // Send the frame first, then get the next ones
        var frame = nextFrame || activeSequence.frames[currentFrame]; //frameBuffer[currentFrame];
        if (frame) {
            if (debug) console.log('Sending frame ' + JSON.stringify(frame));
            _sendFrame(frame);
        } else {
            if (debug) console.log('Frame not found ' + currentFrame);
        }

        //var currentAction = activeSequence.frames[currentFrame];
        // reset frame counter
        //if (currentFrame < frameBuffer.length - 1) {

        if (currentFrame < activeSequence.length - 1) {
            currentFrame++;
        } else {
            currentFrame = 0;
            _sequenceEnd();
        }
        // TODO: prepare the next frame for sending
        // like, pre-stringify each action!
        // TODO: pre-stringify long before here, please. ;)
        nextFrame = activeSequence.frames[currentFrame];

        // and set a timeout when to call this next
        // TODO: This may actually cause timing drift; any delay in processing will offset the timing
        //      so use interval instead

        timeoutHandle = setTimeout(_sendNext, clock.interval);
    }

    function _sequenceEnd() {
        if (nextSequence) {
            activeSequence = nextSequence;
            if (debug) console.log('New Pattern Changed');
            nextSequence = null;
        }
    }

    return {
        setServer: function (server) {
            if (!socketServer) {
                //if (debug) console.log('Setting server to controller...');
                socketServer = server;
                _sendNext();
            }
        },
        setPattern: _setPattern,
        refresh: _refreshAnimation,
        sendFrame: _sendFrame
    };
})();