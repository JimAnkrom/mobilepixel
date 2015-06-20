/**
 * Created by Jim Ankrom on 6/14/2015.
 *
 * Wires up socket handlers to appropriate mobilepixel controller actions
 *
 */
var controller = require('./mobilepixel.controller');

module.exports = function (server, debug) {


    //close
    //Fired when the client is disconnected.
    //    Arguments
    //String: reason for closing
    //    Object: description object (optional)
    function _onClose (reason) {}

    //error
    //Fired when an error occurs.
    //    Arguments
    //Error: error object
    function _onError (error) {}

    //packet
    //Called when a socket received a packet (message, ping)
    //Arguments
    //type: packet type
    //data: packet data (if type is message)
    function _onPacket (type, data) {}

    //message
    //Fired when the client sends a message.
    //    Arguments
    //String or Buffer: Unicode string or Buffer with binary contents
    function _onMessage (message) {

    }

    function _onConnect (socket) {
        //socket.send('hello world');
        var testAction = {
            action: "setColor",
            params: { color: "red"}
        };
        socket.send(JSON.stringify(testAction));
    }

    return {
        onConnection: function (socket) {

            socket.on('close', _onClose);
            socket.on('error', _onError);
            socket.on('message', _onMessage);
            socket.on('packet', _onPacket);

            if (debug) console.log('Socket connected from ' + JSON.stringify(socket.request.headers));
            _onConnect(socket);
        }
    };
}

/*
 flush
 Called when the write buffer is being flushed.
 Arguments
 Array: write buffer
 drain
 Called when the write buffer is drained
 packetCreate
 Called before a socket sends a packet (message, pong)
 Arguments
 type: packet type
 data: packet data (if type is message)
 */