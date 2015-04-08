'use strict';

//---------//
// Imports //
//---------//

var bPromise = require('bluebird')
    , S = require('string.js')
    , utils = require('./utils');


//------//
// Model //
//------//

function BXMLHttpRequest() {
    var self = this;
    self.xhr = new XMLHttpRequest;

    self.my = {
        BaseUrl: null
        , IsJSONRequest: null
    };

    self.BaseUrl = function BaseUrl(baseurl_) {
        var res = my.BaseUrl;
        if (arguments.length > 0) {
            if (baseurl_ !== null) {
                BXMLHttpRequest.ValidateBaseUrl(baseurl_, true);
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
                BXMLHttpRequest.ValidateIsJSON(isjson_, true);
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

BXMLHttpRequest.ValidateBaseUrl = function ValidateBaseUrl(input, throwErr) {
    var msg = '';
    if (typeof input !== 'string') {
        msg = 'Invalid Argument: <BXMLHttpRequest>.ValidateBaseUrl requires a typeof string argument';
    }

    if (throwErr && msg) {
        throw new Error(msg);
    }

    return msg;
};

BXMLHttpRequest.ValidateIsJSON = function ValidateIsJSON(input, throwErr) {
    var msg = '';
    var errMsg = 'Invalid Argument: <BXMLHttpRequest>.ValidateIsJSON requires a typeof boolean argument or string equal to "true" or "false"';

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

BXMLHttpRequest.prototype.open = function open(method, url) {
    this.xhr.open("GET", this._getUrl(url));
    if (this.IsJSON()) {
        this.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    }
};
BXMLHttpRequest.prototype.setRequestHeader = function setRequestHeader(header, value) {
    this.xhr.setRequestHeader(header, value);
};
BXMLHttpRequest.prototype.send = function send(data) {
    var self = this;
    if (this.IsJSON()) {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        } else if ((typeof data === 'string' && !isJson(data)) || typeof data !== 'string') {
            throw new Error("Invalid Argument: <BXMLHttpRequest>.send requires data to be valid JSON when the IsJSON property is true");
        }
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


//-------------------------------//
// Private Prototyped Extensions //
//-------------------------------//

BXMLHttpRequest.prototype._getUrl = function _getUrl(url) {
    var res;
    if (this.BaseUrl() === null) {
        res = url;
    } else {
        var burl = S(this.BaseUrl()).ensureRight('/');
        var url = S(url).chompLeft('/');
        res = burl.s + url.s;
    }
    return res;
}


//---------//
// Exports //
//---------//

module.exports = BXMLHttpRequest;
