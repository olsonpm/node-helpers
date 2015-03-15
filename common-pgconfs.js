'use strict';

var PGConf = require('./psql-wrapper').PGConf;
var e = process.env;

if (e.PGUSER && e.PGDATABASE && e.PGPASSWORD && e.PGPORT) {
    module.exports.ptq = new PGConf({
        user: e.PGUSER
        , database: e.PGDATABASE
        , password: e.PGPASSWORD
        , port: e.PGPORT
        , host: '/run/postgresql'
        , ssl: true
    });
}

if (e.PGTESTUSER && e.PGTESTPASS) {
    module.exports.test = new PGConf({
        user: e.PGTESTUSER
        , database: e.PGTESTUSER
        , password: e.PGTESTPASS
        , port: 5432
        , host: 'localhost'
        , ssl: true
    });
}

module.exports.ptq_test = new PGConf({
    user: 'ptq_test'
    , database: 'ptq_test'
    , password: 'ptq_test'
    , port: 5432
    , host: 'localhost'
    , ssl: true
});
