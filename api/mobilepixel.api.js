/**
 * Created by jim ankrom on 6/13/2015.
 */
    var port = 8000,
    debug = true;
var engine = require('engine.io');
var server = engine.listen(port);
var facade = require('./mobilepixel.socket')(server, debug);

if (debug) console.log('Server Starting up at port ' + port);
server.on('connection', facade.onConnection);

// TODO: error handling
// TODO: admin

// TODO: add a RESTful API to collect client-side exceptions and log them