'use strict';

//---------//
// Imports //
//---------//

var bPromise = require('bluebird');


//------//
// Main //
//------//

function BXMLHttpRequest() {
    this.xhr = new XMLHttpRequest;
    this.xhr.addEventListener("error", reject);
    this.xhr.addEventListener("load", resolve);
}
BXMLHttpRequest.prototype.open = function open(method, url) {
    this.xhr.open("GET", url);
};
BXMLHttpRequest.prototype.setRequestHeader = function setRequestHeader(header, value) {
    this.xhr.setRequestHeader(header, value);
};
BXMLHttpRequest.prototype.send = function send(data) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.xhr.send(data);
    });
};


//---------//
// Exports //
//---------//

module.exports = BXMLHttpRequest;
