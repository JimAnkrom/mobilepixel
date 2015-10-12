/**
 * Created by jim ankrom on 6/13/2015.
 */
var port = 8000,
    apiPort = 7000,
    debug = true;
var engine = require('engine.io');
var server = engine.listen(port);
var facade = require('./mobilepixel.socket')(server, debug);
var controller = require('./mobilepixel.controller');
var config = require('./mobilepixel.config'),
    express = require('express'),
    bodyParser = require('body-parser');

if (debug) console.log('Server Starting up at port ' + port);
server.on('connection', facade.onConnection);

function log(message) {
    if (config.debug) console.log(message);
}

// Set all Access-Control headers for CORS OPTIONS preflight
function accessControlOptions (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // respond immediately to OPTIONS preflight request
    if ('OPTIONS' == req.method) {
        res.status(200).end();
    }
    else {
        next();
    }
}

// Configure express app
var app = express();
app.use(accessControlOptions);
//app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/json' }));
app.use(bodyParser.json({ type: 'text/plain' }));


// TODO: Sequencer API
// Pattern resource
app.post(config.api.pattern, function (req, res) {
    log(JSON.stringify(req.body));
    log('New Pattern Uploaded.');
    controller.setPattern(req.body);
    res.end();
});

// TODO: transport API
// TODO: start, restart, nudge, tempo
// TODO: get tempo

// TODO: Channel API
// TODO: add channel?
app.post(config.api.channels, function (req, res) {
    log(JSON.stringify(req));
    var response = [{ id: 1, offset: 20 }];

    res.status(200).json(response);
});
// TODO: list channels
app.get(config.api.channels, function (req, res) {
    log(JSON.stringify(req));
    var response = [{ id: 1, offset: 20 }];

    res.status(200).json(response);
});

function logErrors(err, req, res, next) {
    log(err.stack);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something blew up!', error: err  });
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    res.status(500);
    //res.render('error', { error: err });
    res.end();
}

// Error handling
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

console.log('Starting server on port ' + apiPort + '...');
var httpServer = app.listen(apiPort);


// TODO: error handling


// TODO: admin
// clock { tick: nnn } interval in ms
// program
//  - submit new sequence, interval pattern, or action list
// getConfig


// TODO: add a RESTful API to collect client-side exceptions and log them

// defers execution to next tick AFTER all requests
//process.nextTick()





// some n milliseconds we should -
// - get the frame and send it