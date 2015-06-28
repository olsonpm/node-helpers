'use strict';

var lazy = require('lazy.js').strict();
var Sequence = lazy.Sequence
    , ObjectLikeSequence = lazy.ObjectLikeSequence
    , ArrayLikeSequence = lazy.ArrayLikeSequence
    , AsyncSequence = lazy.AsyncSequence;
var Utils = require('node-utils');
var xor = Utils.xor;


//-----------------------------//
// New Constructors come first //
//-----------------------------//


//----------//
// Sequence //
//----------//

// rotate(1) moves the first element forward one, rotate(-1) moves the first element to the back of the sequence
Sequence.prototype.rotate = function rotate(n) {
    var self = this;
    if (n > 0) {
        var len = self.size();
        self = self.concat(self.first(len - n)).rest(len - n);
    } else if (n < 0) {
        n = -n;
        self = self.concat(self.first(n)).rest(n);
    }

    return self;
};

Sequence.prototype.rotateTo = function rotateTo(e, eqFn) {
    var self = this;

    if (['undefined', 'string', 'function'].indexOf(typeof eqFn) !== -1) {
        self = self.rotate(-(self.indexOf(e, eqFn)));
    } else {
        throw new Error("Invalid Argument: <Sequence>.rotateTo expects an undefined, string, or function type for its second parameter.");
    }

    return self;
};

Sequence.prototype.indexOf = function indexOf(el, eqFn) {
    var foundIndex = -1;

    var normalizedEqFn = Utils.normalizeEqualityFunction(eqFn, "Inavlid Argument: <Sequence>.indexOf expects an undefined, string, or function type for its second parameter.");

    var curIterator = this.getIterator();
    var found = false;
    while (curIterator.moveNext() && !found) {
        found = normalizedEqFn(curIterator.current(), el);
        if (found) {
            foundIndex = curIterator.index;
        }
    }

    return foundIndex;
};

Sequence.prototype.has = function has(el, eqFn) {
    var normalizedEqFn = Utils.normalizeEqualityFunction(eqFn, "Inavlid Argument: <Sequence>.has expects an undefined, string, or function type for its second parameter.");
    return (this.indexOf(el, normalizedEqFn) !== -1);
};

Sequence.prototype.any = Sequence.prototype.has;

Sequence.prototype.allTypeOf = function allTypeOf(type_) {
    if (typeof type_ !== 'string') {
        throw new Error("Invalid Argument: <Sequence>.allTypeOf requires a string argument");
    }
    return this.all(function(e) {
        return (typeof e === type_);
    });
};

Sequence.prototype.allInstanceOf = function allInstanceOf(type_) {
    if (typeof type_ !== 'function') {
        throw new Error("Invalid Argument: <Sequence>.allInstanceOf requires a function argument");
    }
    return this.all(function(e) {
        return (Utils.instance_of(e, type_));
    });
};

Sequence.prototype.equals = function equals(other_, eqFn_) {
    if (!(Utils.instance_of(other_, Sequence))) {
        throw new Error("Invalid Argument: <Sequence>.equals requires a Sequence argument");
    } else if (this === other_) {
        return true;
    } else if ((typeof this.length === 'number') && (typeof other_.length === 'number') && this.length !== other_.length) {
        return false;
    }

    var normalizedEqFn = Utils.normalizeEqualityFunction(eqFn_, "Invalid Argument: <Sequence>.equals requires the second argument to be undefined, a string, or a function");

    var thisIterator = this.getIterator();
    var otherIterator = other_.getIterator();
    var stillEqual = true;
    var shouldIterate
        , unequalLength;

    function iterate(it1_, it2_) {
        var it1Moved = it1_.moveNext();
        var it2Moved = it2_.moveNext();
        return {
            shouldIterate: (it1Moved && it2Moved)
            , unequalLength: (xor(it1Moved, it2Moved))
        };
    }

    var itRes = iterate(thisIterator, otherIterator);
    shouldIterate = itRes.shouldIterate;
    unequalLength = itRes.unequalLength;
    while (stillEqual && shouldIterate && !unequalLength) {
        stillEqual = normalizedEqFn(thisIterator.current(), otherIterator.current());

        itRes = iterate(thisIterator, otherIterator);
        shouldIterate = itRes.shouldIterate;
        unequalLength = itRes.unequalLength;
    }

    return stillEqual && !unequalLength;
};

Sequence.equals = function static_equals(left_, right_, eqFn_) {
    var res;

    if (xor(left_ === null, right_ === null)) {
        res = false;
    } else if (left_ === null && right_ === null) {
        res = true;
    } else { // neither left nor right are null, so we can safely pass them into the equality function
        res = lazy(left_).equals(lazy(right_), eqFn_);
    }

    return res;
};

Sequence.prototype.doWhile = Sequence.prototype.each;

Sequence.prototype.mustFind = function mustFind(predicate) {
    var res = this.find(predicate);
    if (typeof res === 'undefined') {
        throw new Error("Invalid Argument: <Sequence>.mustFind did not find any matching elements");
    }
    return res;
};

//--------------------//
// ObjectLikeSequence //
//--------------------//

ObjectLikeSequence.prototype.constructor = ObjectLikeSequence;
ObjectLikeSequence.prototype.keys = function keys() {
    return new KeySequence(this);
};

ObjectLikeSequence.prototype.values = function values() {
    return new ValueSequence(this);
};

ObjectLikeSequence.prototype.equals = function equals(other_, valEqFn_) {
    if (!(Utils.instance_of(other_, Sequence))) {
        throw new Error("Invalid Argument: <ObjectLikeSequence>.equals requires an ObjectLikeSequence argument");
    } else if (this === other_) {
        return true;
    } else if ((typeof this.length === 'number') && (typeof other_.length === 'number') && this.length !== other_.length) {
        return false;
    }

    // first check the keys
    var stillEqual = this.keys().sort().join("") === other_.keys().sort().join("");

    // if keys are equal, then we need to test their associated values
    if (stillEqual) {
        var normalizedValEqFn = Utils.normalizeEqualityFunction(valEqFn_, "Invalid Argument: <ObjectLikeSequence>.equals requires the second argument to be undefined, a string, or a function");

        var thisKit = this.keys().getIterator();
        while (thisKit.moveNext() && stillEqual) {
            stillEqual = normalizedValEqFn(this.get(thisKit.current()), other_.get(thisKit.current()));
        }
    }

    return stillEqual;
};


//-------------//
// KeySequence //
//-------------//

function KeySequence(parent) {
    this.parent = parent;
}

KeySequence.prototype = new lazy.ObjectLikeSequence();
KeySequence.prototype.constructor = KeySequence;

KeySequence.prototype.each = function each(fn) {
    return this.parent.each(function(v, k) {
        return fn(k);
    });
};

KeySequence.prototype.toArray = function toArray() {
    return this.reduce(function(arr, element) {
        arr.push(element);
        return arr;
    }, []);
};

KeySequence.prototype.getIterator = function getIterator() {
    return new KeyIterator(this.parent);
};

function KeyIterator(sequence) {
    this.iterator = sequence.getIterator();
    this.index = -1;
}

KeyIterator.prototype.current = function current() {
    return this.iterator.current()[0];
};

KeyIterator.prototype.moveNext = function moveNext() {
    return this.iterator.moveNext();
};


//---------------//
// ValueSequence //
//---------------//

function ValueSequence(parent) {
    this.parent = parent;
}

ValueSequence.prototype = new lazy.ObjectLikeSequence();
ValueSequence.prototype.constructor = ValueSequence;

ValueSequence.prototype.getIterator = function getIterator() {
    return new ValueIterator(this.parent);
};

ValueSequence.prototype.each = function each(fn) {
    return this.parent.each(function(v, k) {
        return fn(v);
    });
};

ValueSequence.prototype.toArray = function toArray() {
    return this.reduce(function(arr, element) {
        arr.push(element);
        return arr;
    }, []);
};

function ValueIterator(sequence) {
    this.iterator = sequence.getIterator();
    this.index = -1;
}

ValueIterator.prototype.current = function current() {
    return this.iterator.current()[1];
};

ValueIterator.prototype.moveNext = function moveNext() {
    return this.iterator.moveNext();
};


//-------------------//
// ArrayLikeSequence //
//-------------------//

ArrayLikeSequence.prototype.constructor = ArrayLikeSequence;


//---------------//
// AsyncSequence //
//---------------//

AsyncSequence.prototype.constructor = AsyncSequence;

AsyncSequence.prototype.setNumElementsPerAsync = function setNumElementsPerAsync(num) {
    this.numElementsPerAsync = num;
    return this;
};

AsyncSequence.prototype.each = function AsyncSequence_each(fn) {
    var iterator = this.parent.getIterator(),
        onNextCallback = this.onNextCallback,
        cancelCallback = this.cancelCallback,
        i = 0,
        numElementsPerAsync = this.numElementsPerAsync || 1;

    var handle = new lazy.AsyncHandle(function cancel() {
        if (cancellationId) {
            cancelCallback(cancellationId);
        }
    });

    var cancellationId = onNextCallback(function iterate() {
        cancellationId = null;

        try {
            var mn
                , shouldContinue;

            do {
                mn = iterator.moveNext();
                shouldContinue = fn(iterator.current(), i++) !== false;
            } while (mn && shouldContinue && i % numElementsPerAsync !== 0);

            cancellationId = onNextCallback(iterate);

            if (!mn || !shouldContinue) {
                handle._resolve();
            }
        } catch (e) {
            handle._reject(e);
        }
    });

    return handle;
};


//---------//
// Exports //
//---------//

module.exports = lazy;
