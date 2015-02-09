'use strict';
/* --execute=mocha-- */

var Config = require('./config')
    , chai = require('chai');

var assert = chai.assert;
chai.config.includeStack = true;

suite("config.js", function() {
    var testConf;
    setup(function() {
        testConf = new Config({
            envPrefix: 'testConfig_'
            , packageJsonDir: __dirname
            , packageJsonRootProperty: 'testConfig'
            , _defaultConfig: './config.json'
        });
        process.env['testConfig_' + 'testPropName'] = 'testPropVal';
    });
    test("get package", function get_package() {
        assert.strictEqual(testConf.get('testPropName', {
            location: 'package'
        }), 'testPropVal')
    });
    test("get env", function get_env() {
        assert.strictEqual(testConf.get('testPropName', {
            location: 'env'
        }), 'testPropVal')
    });
    test("get default", function get_defeault() {
        assert.strictEqual(testConf.get('testPropName', {
            location: 'default'
        }), 'testPropVal')
    });
    test("throws error", function throws_error() {
        assert.throw(function() {
            testConf.get('testDefaultPriority', {
                location: 'env'
                , shouldThrow: true
            });
        });
    });
    test("various priority assertions", function various_priority() {
        process.env['testConfig_testPackageJsonPriority'] = 'envVal';
        process.env['testConfig_testEnvPriority'] = 'envVal';

        assert.strictEqual(testConf.get('testPackageJsonPriority'), 'packageJsonVal');
        assert.strictEqual(testConf.get('testEnvPriority'), 'envVal');
        assert.strictEqual(testConf.get('testDefaultPriority'), 'defaultVal');
    });
});
