'use strict';

module.exports = function gsapd(global) {
    if (!global.Power3) {
        throw new Error("The Power3 gsap easing object doesn't exist in the current scope.  Are you certain TweenLite or TweenMax has been loaded properly?");
    }
    return {
        DURATION: 0.4
        , EASE: global.Power3.easeOut
    };
}
