"use strict";

var dualproto = require('dual-protocol');
var m = require('../index');
var test = require('tape');


test('should have register listener', function (t) {
    t.plan(1);
    var d = (dualproto.use(m))();
    d.ephemeral(['eph']);
    t.notEqual(0, d.listeners(['eph', 'register', '**']).length, 'there were no listeners for eph/register');
});

test('should use ephemeral as default route', function (t) {
    t.plan(1);
    var d = (dualproto.use(m))();
    d.ephemeral();
    t.notEqual(0, d.listeners(['ephemeral', 'register', '**']).length, 'there were no listeners for eph/register');
});
