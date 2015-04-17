'use strict';


//---------//
// Imports //
//---------//

var BPromise = require('bluebird')
    , Utils = require('./utils')
    , pg = require('pg').native
    , LogProvider = require('./log-provider')
    , Environment = require('./environment');


//------//
// Init //
//------//

var using = BPromise.using;
BPromise.promisifyAll(pg);
var log = new LogProvider().getLogger();


//--------//
// PGConf //
//--------//

function PGConf(argsObj) {
    argsObj = argsObj || {};
    var confObj = {};

    if (argsObj.user) {
        confObj.user = argsObj.user;
    }
    if (argsObj.database) {
        confObj.database = argsObj.database;
    }
    if (argsObj.password) {
        confObj.password = argsObj.password;
    }
    if (argsObj.port) {
        confObj.port = argsObj.port;
    }
    if (argsObj.host) {
        confObj.host = argsObj.host;
    }
    if (argsObj.ssl) {
        confObj.ssl = argsObj.ssl;
    }

    this.confObj = confObj;
    this.connString = argsObj.connString;

    PGConf.validatePgConf(this);
}

PGConf.prototype.GetConnection = function GetConnection() {
    return this.connString || this.confObj;
}

PGConf.prototype.GeneratePGWrapper = function GeneratePGWrapper() {
    return (new PGWrapper(this));
};


//-------------//
// Constructor //
//-------------//

function PGWrapper(curPgConf_) {
    PGConf.validatePgConf(curPgConf_);
    this.curPgConf = curPgConf_;
}


//-----------------------//
// Prototyped Extensions //
//-----------------------//

PGWrapper.prototype.RunParameterizedQuery = function RunParameterizedQuery(queryText_, queryValues_) {
    return using(getPostgresConnection(this.curPgConf.GetConnection()), function(conn_) {
        var queryConf = {
            text: queryText_
        };
        if (typeof queryValues_ !== 'undefined') {
            queryConf.values = queryValues_;
        }
        return conn_.queryAsync(queryConf);
    });
};

PGWrapper.prototype.RunQuery = function RunQuery(queryText_) {
    return this.RunParameterizedQuery(queryText_);
};

PGWrapper.prototype.end = function end() {
    return pg.end();
};


//-------------//
// Helper Fxns //
//-------------//

// doesn't return anything - just throws an error if invalid
PGConf.validatePgConf = function validatePgConf(pgConf_) {
    if (!Utils.xor(Object.keys(pgConf_.confObj).length, pgConf_.connString)) {
        log.debug('Object.keys(pgConf_.confObj).length');
        log.debug(Object.keys(pgConf_.confObj).length);
        Object.keys(pgConf_.confObj).forEach(function(aKey) {
            log.debug('key/val');
            log.debug(aKey + '/' + pgConf_.confObj[aKey]);
        });
        log.debug(Object.keys(pgConf_.confObj).length);
        log.debug('pgConf_.connString');
        log.debug(pgConf_.connString);
        throw new Error("Invalid Argument: PGConf requires _either_ connString _or_ separate configuration arguments to be passed");
    }

    // parsing the string is unreasonable for now.  Just assume it's correct
    if (pgConf_.connString) {
        return;
    }

    if (!(Utils.instance_of(pgConf_, PGConf))) {
        throw new Error("validatePgConf requires a PGConf argument");
    }
    var err = "";
    var errFields = [];
    if (!pgConf_.confObj.user) {
        errFields.push({
            field: 'user', reason: 'falsy'
        });
    }
    if (!pgConf_.confObj.database) {
        errFields.push({
            field: 'database', reason: 'falsy'
        });
    }
    if (!pgConf_.confObj.password) {
        errFields.push({
            field: 'password', reason: 'falsy'
        });
    }
    if (!pgConf_.confObj.port) {
        errFields.push({
            field: 'port', reason: 'falsy'
        });
    }
    if (!pgConf_.confObj.host) {
        errFields.push({
            field: 'host', reason: 'falsy'
        });
    }
    if (isNullOrUndefined(pgConf_.confObj.ssl)) {
        errFields.push({
            field: 'ssl', reason: 'null or undefined'
        });
    }
    if (errFields.length) {
        var fieldReasons = "";
        errFields.forEach(function(e) {
            fieldReasons += "\n  field: " + e.field + "\n  reason: " + e.reason;
        });
        throw new Error("Invalid Arguments: The following fields were invalid" + fieldReasons);
    }
};

function isNullOrUndefined(prop_) {
    return (typeof prop_ === 'undefined' || prop_ === null);
}

function getPostgresConnection(pgConf_) {
    var close;
    return pg.connectAsync(pgConf_).spread(function(client, done) {
        close = done;
        return client;
    }).disposer(function(client) {
        if (close) {
            close();
        }
    });
}


//---------//
// Exports //
//---------//

module.exports.PGConf = PGConf;
module.exports.PGWrapper = PGWrapper;
