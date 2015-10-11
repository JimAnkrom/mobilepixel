/**
 * Created by cosinezero on 6/29/2015.
 */
/*
 Hot-swappable configuration class for Node.js
 By Jim Ankrom
 */
function Configuration () {
    var fs = require('fs'),
        self = this,
        watchers = {},
        handlers = {};

    this.load = function (configName, path, options) {
        //if (core.debug)
        //    console.log('Configuration.Load(' + configName + '): Begin');
        try {
            var contents = fs.readFileSync(path, 'utf8');
            var config = JSON.parse(contents);
            var eventHandlers = handlers[configName];

            // add the configuration file as a property to the configuration instance
            self[configName] = config;

            // call onLoad event handler
            if (options && options.onload) options.onload(configName, config);
            if (eventHandlers && eventHandlers.onload) eventHandlers.onload(self, configName, config);
        }
        catch(err) {
            if (core.debug)
                console.log('Error: Configuration.Load(' + configName + '): ' + err.message);
        }

        if (!watchers[configName]) {
            watchers[configName] = fs.watch(path, { persistent: true }, function (event, filename) {
                if (event == 'change') {
                    self.load(configName, path, options);
                    if (core.debug) console.log(filename + ' reloaded due to ' + event + ' event on file ' + filename);
                }
            });
        }
    };

    this.attach = function (configName, options) {
        // for each item in options
        var keys = Object.keys(options);
        for (var i=0; i < keys.length; i++)
        {
            var key = keys[i];
            var eventHandlers = handlers[configName];
            if (!eventHandlers) {
                eventHandlers = {};
                handlers[configName] = eventHandlers;
            }
            var handler = eventHandlers[key];
            if (handler) {
                handler.add(options[key]);
            } else {
                eventHandlers[key] = new Multicast(options[key]);
            }
        }
    }
}