'use strict';

if (!Power3) {
    throw new Error("The Power3 gsap easing object doesn't exist in the current scope.  Are you certain TweenLite or TweenMax has been loaded properly?");
}

module.exports.DURATION = 0.4;
module.exports.EASE = Power3.easeOut;
