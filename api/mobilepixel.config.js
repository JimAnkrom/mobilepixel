/**
 * Created by Jim Ankrom on 10/11/2015.
 */

// return the config module
module.exports = {
    "debug": true,
    "server": {
        "port": 8000
    },
    "api": {
        "pattern": "/pattern",
        "transport": {
            "start": "/xport/start",
            "tap": "/xport/tap",
            "nudge": "/xport/nudge",
            "tempo": "/xport/tempo"
        },
        "channels": "/channels"
    }
};