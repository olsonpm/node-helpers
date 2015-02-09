'use strict';

var path = require('path')
    , Lazy = require('./lazy-extensions')
    , bFs = require('fs-bluebird');

function Config(argsObj) {
    argsObj = argsObj || {};

    this.envPrefix = argsObj.envPrefix || "";
    this.packageJsonDir = argsObj.packageJsonDir || "./";
    this.packageJsonRootProperty = argsObj.packageJsonRootProperty || "";

    // this property is meant for testing purposes only
    this._defaultConfig = argsObj._defaultConfig || '../../config.json';

    this.Locations = [
        new Location('PACKAGE', 10, getFromPackageJson, {
            dir: this.packageJsonDir
            , rootProp: this.packageJsonRootProperty
        })
        , new Location('ENV', 20, getFromEnv, {
            envPrefix: this.envPrefix
        })
        , new Location('DEFAULT', 30, getFromDefault, {
            defaultConfig: this._defaultConfig
        })
    ];
}

Config.prototype.get = function get(propName, argsObj) {
    var res;
    argsObj = argsObj || {};
    var location = argsObj.location;
    var shouldThrow = argsObj.shouldThrow;

    if (typeof location === 'undefined') {
        var curLocation = Lazy(this.Locations)
            .sort(function(left, right) {
                return left.priority - right.priority;
            })
            .find(function(l) {
                return l.getProp(propName);
            });

        if (typeof curLocation === 'undefined') {
            throw new Error("Invalid Argument: Configuration property '" + propName + "' not found in any locations");
        }

        res = curLocation.getProp(propName);
    } else { // location is defined
        var curLocation = Lazy(this.Locations)
            .find(function(l) {
                return l.name.toLowerCase() === location.toLowerCase();
            });
        if (typeof curLocation === 'undefined') {
            throw new Error("Invalid Argument: Location '" + location + "' doesn't exist");
        }

        res = curLocation.getProp(propName);
    }

    if (shouldThrow && typeof res === 'undefined') {
        throw new Error("Invalid Argument: Property '" + propName + "' hasn't been set");
    }
    return res;
};


//---------------------------//
// Set up built-in locations //
//---------------------------//

function Location(name_, priority_, getter_, getterArgsObj_) {
    this.name = name_;
    this.priority = priority_;
    this.getter = getter_;
    this.getArgsObj = getterArgsObj_;
}
Location.prototype.getProp = function getProp(propName, shouldThrow) {
    return this.getter.call(this, propName, shouldThrow, this.getArgsObj);
};

Location.PACKAGE = 'PACKAGE';
Location.ENV = 'ENV';
Location.DEFAULT = 'DEFAULT';

function getFromEnv(propName, shouldThrow, argsObj) {
    var res = process.env[argsObj.envPrefix + propName];
    if (shouldThrow && typeof res === 'undefined') {
        throw new Error("Invalid Argument: environment variable '" + propName + "' doesn't exist");
    }
    return res;
}

function getFromPackageJson(propName, shouldThrow, argsObj) {
    var pjson;
    if (argsObj.dir.length > 2 && argsObj.dir.slice(0, 2) === './') {
        pjson = require('./' + path.join(argsObj.dir, 'package.json'));
    } else {
        pjson = require(path.join(argsObj.dir, 'package.json'));
    }
    var res = pjson[argsObj.rootProp][propName];
    if (shouldThrow && typeof res === 'undefined') {
        throw new Error("Invalid Argument: package.json setting '" + argsObj.rootProp + "." + propName + "' doesn't exist");
    }
    return res;
}

function getFromDefault(propName, shouldThrow, argsObj) {
    var configJson;
    var configPath = path.join(__dirname, argsObj.defaultConfig);
    try {
        configJson = require(configPath);
    } catch (err) {
        // config file doesn't exist
        throw new Error("No config.json file exists at '" + configPath + "'");
    }
    var res = configJson[propName];
    if (shouldThrow && typeof res === 'undefined') {
        throw new Error("Invalid Argument: config property '" + propName + "' doesn't exist");
    }
    return res;
}

//-----------------------//
// End of location logic //
//-----------------------//

module.exports = Config;
