'use strict';

//---------//
// Imports //
//---------//

var Lazy = require('lazy.js');

//------//
// Main //
//------//

function Environment(envVar) {
    this.SERVER_ENV = envVar;
}

Environment.DEV = 'DEV';
Environment.TEST = 'TEST';
Environment.PROD = 'PROD';

Environment.ENVS = Lazy([
    Environment.DEV
    , Environment.TEST
    , Environment.PROD
]);

Environment.CLIENT_ENV = 'ENV_NODE_ENV';

Environment.prototype.getCurrentEnvironment = function getCurrentEnvironment() {
    var res;
    if (process && process.env && Environment.ENVS.contains(process.env[this.SERVER_ENV])) {
        res = process.env.NODE_ENV;
    } else if (Environment.ENVS.contains(Environment.CLIENT_ENV)) {
        res = Environment.CLIENT_ENV;
    } else {
        throw new Error("Invalid State: Environment.getCurrentEnvironment expects to be called either server-side with NODE_ENV declared, or client-side with the server replacing ENV_NODE_ENV with the proper node environment");
    }

    return res;
};
Environment.prototype.curEnv = Environment.prototype.getCurrentEnvironment;

Environment.prototype.isDev = function isDev() {
    return this.getCurrentEnvironment() === Environment.DEV;
};
Environment.prototype.isDev = function isTest() {
    return this.getCurrentEnvironment() === Environment.TEST;
};
Environment.prototype.isDev = function isProd() {
    return this.getCurrentEnvironment() === Environment.PROD;
};


//---------//
// Exports //
//---------//

module.exports = Environment;
