'use strict';

//---------//
// Imports //
//---------//

var bPromise = require('bluebird')
    , S = require('string')
    , utils = require('./utils');


//-------//
// Model //
//-------//

function BRequest() {
    var self = this;

    var my = {
        BaseUrl: null
        , IsJSONRequest: null
    };

    self.BaseUrl = function BaseUrl(baseurl_) {
        var res = my.BaseUrl;
        if (arguments.length > 0) {
            if (baseurl_ !== null) {
                BRequest.ValidateBaseUrl(baseurl_, true);
            }
            my.BaseUrl = baseurl_;
            res = self;
        }
        return res;
    };

    self.IsJSON = function IsJSON(isjson_) {
        var res = my.IsJSON;
        if (arguments.length > 0) {
            if (isjson_ !== null) {
                BRequest.ValidateIsJSON(isjson_, true);
            }
            my.IsJSON = isjson_;
            res = self;
        }
        return res;
    };
}


//------------//
// Validation //
//------------//

BRequest.ValidateBaseUrl = function ValidateBaseUrl(input, throwErr) {
    var msg = '';
    if (typeof input !== 'string') {
        msg = 'Invalid Argument: <BRequest>.ValidateBaseUrl requires a typeof string argument';
    }

    if (throwErr && msg) {
        throw new Error(msg);
    }

    return msg;
};

BRequest.ValidateIsJSON = function ValidateIsJSON(input, throwErr) {
    var msg = '';
    var errMsg = 'Invalid Argument: <BRequest>.ValidateIsJSON requires a typeof boolean argument or string equal to "true" or "false"';

    if (typeof input === 'string') {
        input = input.toLowerCase();
        if (input !== 'true' && input !== 'false') {
            msg = errMsg;
        } else {
            input = (input === 'true');
        }
    }
    if (typeof input !== 'boolean') {
        msg = errMsg;
    }

    if (throwErr && msg) {
        throw new Error(msg);
    }

    return msg;
};


//-----------------------//
// Prototyped Extensions //
//-----------------------//

BRequest.prototype.get = function get(opts) {
    var url = opts.url;
    if (!url || (typeof url !== 'string')) {
        throw new Error("Invalid Argument: <BRequest>.get requires a string url");
    }

    return this._transmit({
        method: 'GET', url: this._getUrl(url)
    });
};


//-------------------------------//
// Private Prototyped Extensions //
//-------------------------------//

BRequest.prototype._transmit = function _transmit(opts) {
    var self = this;

    var xhr = new XMLHttpRequest();
    var method = opts.method;
    var url = opts.url;
    var data = opts.data || null;

    if (this.IsJSON()) {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        } else if ((typeof data === 'string' && !isJson(data)) || typeof data !== 'string') {
            throw new Error("Invalid Argument: <BRequest>.send requires data to be valid JSON when the IsJSON property is true");
        }

        this.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    }

    var res = new bPromise(function(resolve, reject) {
        self.xhr.addEventListener("error", reject);
        self.xhr.addEventListener("load", resolve);
        self.xhr.send(data);
    });

    if (this.IsJSON()) {
        res = res.then(function(response) {
            return JSON.parse(response);
        });
    }

    return res;
};

BRequest.prototype._getUrl = function _getUrl(url) {
    var res;
    if (this.BaseUrl() === null) {
        res = url;
    } else {
        var burl = S(this.BaseUrl()).ensureRight('/');
        url = S(url).chompLeft('/');
        res = burl.s + url.s;
    }
    return res;
};


//---------//
// Helpers //
//---------//

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


//---------//
// Exports //
//---------//

module.exports = BRequest;
