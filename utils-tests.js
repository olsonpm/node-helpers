'use strict';
/* --execute=mocha-- */

var Utils = require('./utils')
    , chai = require('chai');

var assert = chai.assert;
chai.config.includeStack = true;

suite("utils.js", function() {
    test("instance_of", function instance_of() {
        var aGrandparent
            , aParent
            , aChild;
        var wParent
            , wChild;

        function Grandparent() {}

        function Parent() {}

        function Child() {}

        function WildParent() {}

        function WildChild() {}

        Parent.prototype = new Grandparent();
        Parent.prototype.constructor = Parent;
        WildParent.prototype = new Grandparent();
        WildParent.prototype.constructor = WildParent;

        Child.prototype = new Parent();
        Child.prototype.constructor = Child;
        WildChild.prototype = new WildParent();
        WildChild.prototype.constructor = WildChild;

        aGrandparent = new Grandparent();
        aParent = new Parent();
        wParent = new WildParent();
        aChild = new Child();
        wChild = new WildChild();

        assert.isTrue(Utils.instance_of(aGrandparent, Grandparent));
        assert.isFalse(Utils.instance_of(aGrandparent, Parent));

        assert.isTrue(Utils.instance_of(aParent, Grandparent));
        assert.isTrue(Utils.instance_of(aParent, Parent));
        assert.isFalse(Utils.instance_of(aParent, Child));
        assert.isFalse(Utils.instance_of(aParent, WildParent));

        assert.isTrue(Utils.instance_of(aChild, Grandparent));
        assert.isTrue(Utils.instance_of(aChild, Parent));
        assert.isTrue(Utils.instance_of(aChild, Child));
        assert.isFalse(Utils.instance_of(aChild, WildParent));

        assert.isTrue(Utils.instance_of(wChild, Grandparent));
        assert.isTrue(Utils.instance_of(wChild, WildParent));
        assert.isTrue(Utils.instance_of(wChild, WildChild));
        assert.isFalse(Utils.instance_of(wChild, Parent));
    });

    test("is_numeric", function is_numeric() {
        assert.isTrue(Utils.isNumeric(1));
        assert.isTrue(Utils.isNumeric("1"));
        assert.isFalse(Utils.isNumeric(Infinity));
    });

    test("repeat_string", function repeat_string() {
        assert.strictEqual(Utils.repeatString("a", 0), "");
        assert.strictEqual(Utils.repeatString("a", 1), "a");
        assert.strictEqual(Utils.repeatString("a", 5), "aaaaa");
        assert.throws(function() {
            Utils.repeatString(1, "ok");
        })
    });

    test("every_combination_of", function every_combination_of() {
        var a = [1, 2, 3]
            , b = ['a', 'b', 'c']
            , c = ['x', 'y', 'z'];

        var expected = [
            [1, 'a', 'x'],
            [1, 'a', 'y'],
            [1, 'a', 'z'],
            [1, 'b', 'x'],
            [1, 'b', 'y'],
            [1, 'b', 'z'],
            [1, 'c', 'x'],
            [1, 'c', 'y'],
            [1, 'c', 'z'],
            [2, 'a', 'x'],
            [2, 'a', 'y'],
            [2, 'a', 'z'],
            [2, 'b', 'x'],
            [2, 'b', 'y'],
            [2, 'b', 'z'],
            [2, 'c', 'x'],
            [2, 'c', 'y'],
            [2, 'c', 'z'],
            [3, 'a', 'x'],
            [3, 'a', 'y'],
            [3, 'a', 'z'],
            [3, 'b', 'x'],
            [3, 'b', 'y'],
            [3, 'b', 'z'],
            [3, 'c', 'x'],
            [3, 'c', 'y'],
            [3, 'c', 'z'],
        ];

        var actual = Utils.everyCombinationOf(a, b, c);
        assert.strictEqual(actual.length, expected.length);
        console.log(actual);
        expected.forEach(function(aVal, i) {
            switch (i % 3) {
                case 0:
                    assert.strictEqual(aVal[2], 'x');
                    break;
                case 1:
                    assert.strictEqual(aVal[2], 'y');
                    break;
                case 2:
                    assert.strictEqual(aVal[2], 'z');
                    break;
            }
            switch (Math.floor(i / 3) % 3) {
                case 0:
                    assert.strictEqual(aVal[1], 'a');
                    break;
                case 1:
                    assert.strictEqual(aVal[1], 'b');
                    break;
                case 2:
                    assert.strictEqual(aVal[1], 'c');
                    break;
            }
            switch (Math.floor(i / 9)) {
                case 0:
                    assert.strictEqual(aVal[0], 1);
                    break;
                case 1:
                    assert.strictEqual(aVal[0], 2);
                    break;
                case 2:
                    assert.strictEqual(aVal[0], 3);
                    break;
            }
        });
    });
});
