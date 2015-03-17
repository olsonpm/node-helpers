'use strict';

var xor = require('component-xor');

function bothNullOrEquals(left_, right_, eqFn_) {
    var normalizedEqFn = normalizeEqualityFunction(eqFn_, "Invalid Argument: bothNullOrEquals requires an undefined, string, or function argument");
    var res;
    if (xor(left_ === null, right_ === null)) {
        res = false;
    } else if (left_ === null && right_ === null) {
        res = true;
    } else { // neither left nor right are null, so we can safely pass them into the equality function
        res = normalizedEqFn(left_, right_);
    }

    return res;
}

// make sure to pass this as the eqFn into bothNullOrEquals so you don't get a null error
function dateEqFn(left_, right_) {
    return left_.getTime() === right_.getTime();
}

function normalizeEqualityFunction(eqFn_, err_) {
    var normalizedEqFn;

    // Logic for below is as follows:
    //   - If eqFn is undefined, then test for strict equality
    //   - If it is a string, then we assume the iterated element has an equality property named whatever eqFn is
    //   - If it's a function, then we assume it takes in two arguments and returns a boolean for equality.
    //   - normalizedEqFn turns each of the above into a normalized equality function(left, right).
    if (typeof eqFn_ === 'undefined') {
        normalizedEqFn = function(left, right) {
            return left === right;
        };
    } else if (typeof eqFn_ === 'string') {
        normalizedEqFn = function(left, right) {
            return left[eqFn_](right);
        };
    } else if (typeof eqFn_ === 'function') {
        normalizedEqFn = eqFn_;
    } else {
        var msg = (typeof err_ === 'string') ? err_ : "Invalid Argument: normalizedEqualityFunction requires an undefined, string, or function argument";

        throw new Error(msg);
    }

    return normalizedEqFn;
}

function in_array(item, arr) {
    return arr.indexOf(item) !== -1;
}

function instance_of(obj, fxn) {
    if (typeof obj !== 'object') {
        return false;
    }

    var found = false;
    var objProto = Object.getPrototypeOf(obj);
    while (objProto !== null && !found) {
        found = objProto.constructor.name === fxn.name;
        objProto = Object.getPrototypeOf(objProto);
    }
    return found;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function repeatString(str, count) {
    if (typeof str !== 'string' || isNaN(count)) {
        throw new Error("Invalid Argument: Utils.repeatString requires a typeof string followed by a number argument");
    }

    if (count < 1) return '';
    var result = '';
    while (count > 1) {
        if (count & 1) result += str;
        count >>= 1, str += str;
    }
    return result + str;
}

function everyCombinationOf(arrayN) {
    var argsArray = Array.prototype.slice.call(arguments);

    if (argsArray.length < 2) {
        throw new Error("Invalid Argument: Utils.everyCombinationOf requires at least two arrays");
    }

    var allArgsAreArrays = true;
    var i = 0;
    while (allArgsAreArrays && i < argsArray.length) {
        var curArg = argsArray[0];
        if (!instance_of(curArg, Array)) {
            allArgsAreArrays = false;
        }
        i += 1;
    };
    if (!allArgsAreArrays) {
        throw new Error("Invalid Argument: Utils.everyCombinationOf requires all arguments to be instance_of Array");
    }

    var res = []
        , oldRes = [];

    argsArray.forEach(function(anArray, i) {
        if (oldRes.length) {
            oldRes.forEach(function(key) {
                anArray.forEach(function(aVal) {
                    res.push(key.concat(aVal));
                });
            });
        } else {
            anArray.forEach(function(aVal) {
                res.push([aVal]);
            });
        }

        if (i < argsArray.length - 1) {
            oldRes = res;
            res = [];
        }
    });

    return res;
}


//---------//
// Exports //
//---------//

module.exports.xor = xor;
module.exports.bothNullOrEquals = bothNullOrEquals;
module.exports.dateEqFn = dateEqFn;
module.exports.normalizeEqualityFunction = normalizeEqualityFunction;
module.exports.in_array = in_array;
module.exports.instance_of = instance_of;
module.exports.isNumeric = isNumeric;
module.exports.repeatString = repeatString;
module.exports.everyCombinationOf = everyCombinationOf;
