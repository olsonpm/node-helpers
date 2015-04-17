'use strict';

//---------//
// Imports //
//---------//

var bunyan = require('bunyan')
    , bunyanStreams = require('./bunyan-streams')
    , Utils = require('./utils')
    , Environment = require('./environment')
    , pkginfo = require('pkginfo')
    , path = require('path');


//------//
// Main //
//------//

function LogProvider() {
    var self = this;

    var my = {
        EnvInst: null
        , AppName: null
        , AllowDefaultEnvInst: true
        , AllowDefaultAppName: true
        , DefaultEnvInst: new Environment()
        , DefaultAppName: pkginfo(module, 'name').name
    };

    self.EnvInst = function(envinst_) {
        var res = my.EnvInst;
        if (arguments.length > 0) {
            if (envinst_ !== null) {
                LogProvider.ValidateEnvInst(envinst_, true);
            }
            my.EnvInst = envinst_;
            res = self;
        } else if (self.AllowDefaultEnvInst()) {
            res = res || my.DefaultEnvInst;
        }
        return res;
    };

    self.AppName = function(appname_) {
        var res = my.AppName;
        if (arguments.length > 0) {
            if (dataid_ !== null) {
                LogProvider.ValidateAppName(appname_, true);
            }
            my.AppName = appname_;
            res = self;
        } else if (self.AllowDefaultEnvInst()) {
            res = res || my.DefaultAppName;
        }
        return res;
    };

    self.AllowDefaultEnvInst = function(allowdefaultenvinst_) {
        var res = my.AllowDefaultEnvInst;
        if (arguments.length > 0) {
            if (dataid_ !== null) {
                LogProvider.ValidateAllowDefaultEnvInst(allowdefaultenvinst_, true);
            }
            my.AllowDefaultEnvInst = allowdefaultenvinst_;
            res = self;
        }
        return res;
    };

    self.AllowDefaultAppName = function(allowdefaultappname_) {
        var res = my.AllowDefaultAppName;
        if (arguments.length > 0) {
            if (dataid_ !== null) {
                LogProvider.ValidateAllowDefaultAppName(allowdefaultappname_, true);
            }
            my.AllowDefaultAppName = allowdefaultappname_;
            res = self;
        }
        return res;
    };
}


//------------//
// Validation //
//------------//

LogProvider.ValidateEnvInst = function ValidateEnvInst(input, throwErr) {
    var msg = '';
    if (Utils.instance_of(input, Environment)) {
        msg = 'Invalid Argument: <LogProvider>.ValidateEnvInst requires an instance_of Environment argument';
    }

    if (throwErr && msg) {
        throw new Error(msg);
    }

    return msg;
};

LogProvider.ValidateAppName = function ValidateAppName(input, throwErr) {
    var msg = '';
    if (typeof input === 'string') {
        msg = 'Invalid Argument: <LogProvider>.ValidateAppName requires a typeof string argument';
    }

    if (throwErr && msg) {
        throw new Error(msg);
    }

    return msg;
};

LogProvider.ValidateDefaultEnvInst = function ValidateDefaultEnvInst(input, throwErr) {
    var msg = '';
    if (typeof input === 'boolean') {
        msg = 'Invalid Argument: <LogProvider>.ValidateDefaultEnvInst requires a typeof boolean argument';
    }

    if (throwErr && msg) {
        throw new Error(msg);
    }

    return msg;
};

LogProvider.ValidateDefaultAppName = function ValidateDefaultAppName(input, throwErr) {
    var msg = '';
    if (typeof input === 'boolean') {
        msg = 'Invalid Argument: <LogProvider>.ValidateDefaultAppName requires a typeof boolean argument';
    }

    if (throwErr && msg) {
        throw new Error(msg);
    }

    return msg;
};


//-----------------------//
// Prototyped Extensions //
//-----------------------//

LogProvider.prototype.getLogger = function getLogger() {
    if (this.EnvInst() === null || this.AppName() === null) {
        throw new Error("Invalid State: <LogProvider>.getLogger requires both EnvInst and AppName to either be set or allowed to use their defaults");
    }

    var bstream = bunyanStreams(this.AppName(), this.EnvInst().curEnv());
    return bunyan.createLogger({
        name: appName
        , src: bstream.source
        , streams: [{
            level: bstream.level
            , stream: bstream.stream
            , type: bstream.type
        }]
    });
};


//---------//
// Exports //
//---------//

module.exports = LogProvider;
