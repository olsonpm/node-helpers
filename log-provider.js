'use strict';

//---------//
// Imports //
//---------//

var bunyan = require('bunyan')
    , bunyanStreams = require('./bunyan-streams')
    , Utils = require('./utils')
    , Environment = require('./environment')
    , root = require('app-root-path')
    , path = require('path')
    , fs = require('fs');


//------//
// Main //
//------//

function LogProvider() {
    var self = this;

    var tmpDefaultAppName;
    if (require && require.main && require.main.filename) {
        var rootPath = root.path
            , rootPkgConf = path.join(root.path, 'package.json')
            , found = fs.existsSync(rootPkgConf);
        while (!found) {
            rootPath = path.dirname(rootPath);
            rootPkgConf = path.join(rootPath, 'package.json');
            found = fs.existsSync(rootPkgConf);
        }
        if (!found) {
            throw new Error("Invalid State: No package.json files were found up the directory path starting from '" + root.path);
        } else {
            rootPkgConf = require(rootPkgConf);
        }

        tmpDefaultAppName = rootPkgConf.name;
    }
    tmpDefaultAppName = tmpDefaultAppName || null;

    var my = {
        EnvInst: null
        , AppName: null
        , AllowDefaultEnvInst: true
        , AllowDefaultAppName: true
        , DefaultEnvInst: new Environment()
        , DefaultAppName: tmpDefaultAppName
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
            if (appname_ !== null) {
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
            if (allowdefaultenvinst_ !== null) {
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
            if (allowdefaultappname_ !== null) {
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
    if (!Utils.instance_of(input, Environment)) {
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

LogProvider.ValidateAllowDefaultEnvInst = function ValidateAllowDefaultEnvInst(input, throwErr) {
    var msg = '';
    if (typeof input === 'boolean') {
        msg = 'Invalid Argument: <LogProvider>.ValidateDefaultEnvInst requires a typeof boolean argument';
    }

    if (throwErr && msg) {
        throw new Error(msg);
    }

    return msg;
};

LogProvider.ValidateAllowDefaultAppName = function ValidateAllowDefaultAppName(input, throwErr) {
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
        name: this.AppName()
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
