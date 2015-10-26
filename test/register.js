"use strict";

var dualproto = require('dual-protocol');
var m = require('../index');
var test = require('tape');

test('dual-ephemeral register', function (t) {
    var test = function (desc, f) {
        // before each
        var ctxt = {
            d: (dualproto.use(m))()
        };
        ctxt.d.ephemeral(['eph']);
        t.test(desc, f.bind(ctxt));
    };

    test('should have listeners for register', function (s) {
        s.plan(1);
        s.notEqual(0, this.d.listeners(['eph', 'register', '**']).length, 'there were no listeners for eph/register');
    });
});

