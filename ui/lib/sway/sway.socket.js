/**
 *
 *   Sway Socket Extensions
 *   Created by Jim Ankrom on 12/14/2014.
 *
 *   - Multicast Events
 *   -
 *
 *   Requires:
 *   - Engine.io ( repo at https://github.com/Automattic/engine.io-client )
 *   - Multicast ( clone at https://gist.github.com/087c895971dc20ce9e37.git )
 *
 *   Reference:
 *   engine.io's packet prefixes -
 var packets = exports.packets = {
        open:     0    // non-ws
      , close:    1    // non-ws
      , ping:     2
      , pong:     3
      , message:  4
      , upgrade:  5
      , noop:     6
    };
 */
var sway = sway || {};

sway.Socket = function (config) {
    var self = this;
    this.verbose = false;
    var delimiter = this.delimiter = config.delimiter || '|';
    var socket;

    this.log = function (source, data) {
        if (self.verbose && console) console.log('[' + source + ']: ' + JSON.stringify(data));
    };

    // Assign handlers
    this.onHandshake = multicast(self.log.bind(self, 'handshake'));
    this.onConnect = multicast(self.log.bind(self, 'connect'));
    this.onMessage = multicast(self.log.bind(self, 'message'));
    this.onClose = multicast(self.log.bind(self, 'close'));
    this.onError = multicast(function (error) {
        //if (bleepout.debug && console)
        console.log('Socket Error: ' + error.message);
    });
    this.onOpen = multicast(function () {
        socket.on('message', self.onMessage);
        socket.on('close', self.onClose);
        socket.on('error', self.onError);
        self.onConnect("Entering Connect");
    });

    this.connect = function () {
        /*
         ( Engine.io - in reverse order)
         open is emitted by Socket.onOpen and Transport.onOpen
         Socket.onOpen is called by socket.onHandshake
         Socket.onHandshake is called by Socket.onPacket
         Socket.onPacket is a pass-through call from Transport's 'packet' event handler
         Transport's packet event is emitted by Transport.onPacket
         Transport.onPacket is raised by Transport.onData after calling parser.decodePacket
         */
        socket = eio(config.socketAddress, { "transports": ['websocket']});
        socket.on('open', self.onOpen);
        socket.on('handshake', self.onHandshake);
    };

    this.send = function (message) {
        if (socket) {
            if (self.verbose) self.log('send', JSON.stringify(message));
            socket.send(message);
        }
    };

    return this;
};
