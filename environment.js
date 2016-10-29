'use strict';


//---------//
// Imports //
//---------//

var lazy = require('./lazy-extensions');


//-------------------//
// Static Properties //
//-------------------//

Environment.DEV = 'dev';
Environment.TEST = 'test';
Environment.PROD = 'prod';

Environment.ENVS = lazy([
  Environment.DEV
  , Environment.TEST
  , Environment.PROD
]);

Environment.CLIENT_ENV = 'ENV_NODE_ENV';


//------//
// Main //
//------//

function Environment() {
  var self = this;

  var my = {
    HardCoded: null
    , ServerEnv: null
    , DefaultServerEnv: 'WEATHER_ACCURACY_NODE_ENV'
    , AllowDefaultServerEnv: true
  };

  self.HardCoded = function(hardcoded_) {
    var res = my.HardCoded;
    if (arguments.length > 0) {
      if (hardcoded_ !== null) {
        if (!self.AllowDefaultServerEnv() && self.ServerEnv() !== null) {
          throw new Error('Invalid State: When setting ValidateHardCoded, ServerEnv must equal null');
        }
        Environment.ValidateHardCoded(hardcoded_, true);
      }
      my.HardCoded = hardcoded_;
      res = self;
    }
    return res;
  };

  self.ServerEnv = function(serverenv_) {
    var res = my.ServerEnv;
    if (arguments.length > 0) {
      if (serverenv_ !== null) {
        if (self.HardCoded()) {
          throw new Error('Invalid State: When setting ValidateServerEnv, HardCoded must equal null');
        }
        Environment.ValidateServerEnv(serverenv_, true);
      }
      my.ServerEnv = serverenv_;
      res = self;
    } else if (self.AllowDefaultServerEnv()) {
      res = res || my.DefaultServerEnv;
    }
    return res;
  };

  self.AllowDefaultServerEnv = function(allowdefaultserverenv_) {
    var res = my.AllowDefaultServerEnv;
    if (arguments.length > 0) {
      if (allowdefaultserverenv_ !== null) {
        Environment.ValidateAllowDefaultServerEnv(allowdefaultserverenv_, true);
      }
      my.AllowDefaultServerEnv = allowdefaultserverenv_;
      res = self;
    }
    return res;
  };
}


//------------//
// Validation //
//------------//

Environment.ValidateHardCoded = function ValidateHardCoded(input, throwErr) {
  var msg = '';

  if (typeof input !== 'string') {
    msg = 'Invalid Argument: <Environment>.ValidateHardCoded requires a typeof string argument';
  } else {
    msg = Environment.ValidateEnv(input, throwErr);
  }

  if (throwErr && msg) {
    throw new Error(msg);
  }

  return msg;
};

Environment.ValidateServerEnv = function ValidateServerEnv(input, throwErr) {
  var msg = '';

  if (typeof input !== 'string') {
    msg = 'Invalid Argument: <Environment>.ValidateServerEnv requires a typeof string';
  } else if (!process
    || !process.env
    || typeof process.env[input] === 'undefined'
    || Environment.ValidateEnv(process.env[input])) {

    msg = "Invalid Argument: process.env." + input + " is undefined.  <Environment>.ValidateServerEnv requires an existing environment variable name";
  }

  if (throwErr && msg) {
    throw new Error(msg);
  }

  return msg;
};

Environment.ValidateAllowDefaultServerEnv = function ValidateAllowDefaultServerEnv(input, throwErr) {
  var msg = '';
  if (typeof input !== 'boolean') {
    msg = 'Invalid Argument: <Environment>.ValidateAllowDefaultServerEnv requires a typeof boolean argument';
  }

  if (throwErr && msg) {
    throw new Error(msg);
  }

  return msg;
};

Environment.ValidateEnv = function ValidateEnv(env, throwErr) {
  var msg = "";

  if (typeof env !== 'string') {
    throw new Error("Invalid Argument: Environment.ValidateEnv only validates environment strings");
  }

  if (!Environment.ENVS.has(env.toLowerCase())) {
    msg = "Invalid Argument: environment '" + env + "' doesn't match one of the following " + Environment.ENVS.toArray();
  }

  if (throwErr && msg) {
    throw new Error(msg);
  }

  return msg;
};


//-----------------------//
// Prototyped Extensions //
//-----------------------//

Environment.prototype.getCurrentEnvironment = function getCurrentEnvironment() {
  this._validateState();

  var res;

  if (this.HardCoded()) {
    res = this.HardCoded();
  } else if (process
    && process.env
    && process.env[this.ServerEnv()]
    && Environment.ENVS.contains(process.env[this.ServerEnv()].toLowerCase())) {
    res = process.env[this.ServerEnv()];
  } else if (Environment.ENVS.contains(Environment.CLIENT_ENV)) {
    res = Environment.CLIENT_ENV;
  }

  if (!res || !Environment.ENVS.contains(res.toLowerCase())) {
    throw new Error('Invalid State: No environment was found.  This could be due to relying on a non-existent default ServerEnv.');
  }

  return res;
};
Environment.prototype.curEnv = Environment.prototype.getCurrentEnvironment;

Environment.prototype.isDev = function isDev() {
  return this.getCurrentEnvironment() === Environment.DEV;
};
Environment.prototype.isTest = function isTest() {
  return this.getCurrentEnvironment() === Environment.TEST;
};
Environment.prototype.isProd = function isProd() {
  return this.getCurrentEnvironment() === Environment.PROD;
};


//-------------------------------//
// Private Prototyped Extensions //
//-------------------------------//

Environment.prototype._validateState = function _validateState() {
  // invalid if default server environment isn't allowed, and neither HardCoded nor ServerEnv are set
  if (this.HardCoded() === null
    && this.ServerEnv() === null
    && !Environment.ENVS.contains(Environment.CLIENT_ENV)) {

    throw new Error("Invalid State: None of the following cases were met\n1) A hard coded environment string is passed.\n2) Called server-side with an environment variable"
      + "(specified by ServerEnv()) declared.\n3) Called client-side with the server replacing ENV_" + "NODE_ENV with the proper node environment string");
  }
};


//---------//
// Exports //
//---------//

module.exports = Environment;
