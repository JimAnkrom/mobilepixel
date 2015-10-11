/**
 * Created by Jim Ankrom on 12/14/2014.
 */

// Delimit all optional arguments with delimiter
function delimit (delimiter) {
    var out;
    for (var i=1; i < arguments.length; i++)
    {
        if (out) {
            out+=delimiter;
        } else {
            out = '';
        }
        out+=arguments[i];
    }
    return out;
}

// Multicast Delegate for Event Handlers
// TODO: Build a chain into multicast
function multicast(callback) {
    var self = this,
        multicast = [];

    if (callback) multicast.push(callback);

    function invoke () {
        for (var i = 0; i < multicast.length; i++) {
            multicast[i].apply(self, arguments);
        }
        return this;
    }

    // Add callback to the multicast
    function add (callback) {
        multicast.push(callback);
        return this;
    }

    // Remove callback from the multicast
    function remove (callback) {
        var i, len = multicast.length;

        if (callback && len > 1) {
            for (i = 0; i < len; i++) {
                if (multicast[i] === callback) {
                    multicast.splice(i, 1);
                    return this;
                }
            }
        } else {
            multicast = [];
        }
        return this;
    }

    // Expose public methods
    invoke.add = add;
    invoke.remove = remove;

    return invoke;
}