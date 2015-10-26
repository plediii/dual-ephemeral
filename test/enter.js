"use strict";

var dualproto = require('dual-protocol');
var m = require('../index');
var test = require('tape');

test('dual-ephemeral enter', function (t) {
    var test = function (desc, f) {
        // before each
        var ctxt = {
            d: (dualproto.use(m))()
        };
        ctxt.d.ephemeral(['eph']);
        t.test(desc, f.bind(ctxt));
    };

    test('should have listeners for enter after regsiter', function (s) {
        s.plan(1);
        this.d.send(['eph', 'register', 'host']);
        s.notEqual(0, this.d.listeners(['eph', 'enter', 'host'], 'there were no listeners for eph/enter'));
    });

    test('should emit newNode to ephemeral group when registered address enters', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'enter'], function (body, ctxt) {
            s.pass('enter event received');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
    });

    test('should emit newNode to ephemeral group with hostAddress', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'enter'], function (body, ctxt) {
            s.deepEqual(['host'], ctxt.options.nodeRoute);
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
    });

    test('should not *emit* newNode when non-registered address enters', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'enter'], function () {
            s.fail('eph/newNode emitted');
        });
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        s.pass('Tried  enter/host');
    });

    test('should *not* emit newNode for unregistered source address', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'enter'], function (body, ctxt) {
            s.fail('newNode called');
        });
        this.d.send(['eph', 'enter', 'host']);
        s.pass('Tried  enter/host');
    });
    
    test('should emit newNode with enter body', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'enter'], function (body) {
            s.equal(body, 'body');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener'], 'body');
    });

    test('should emit newNode only once per host', function (s) {
        s.plan(2);
        this.d.mount(['eph-listener', 'enter'], function (body) {
            s.pass('Called once');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        s.pass('send enter twice.');
    });

    test('should emit newNode for each distinct group', function (s) {
        s.plan(2);
        this.d.mount(['eph-listener', 'enter'], function (body) {
            s.pass('Called once');
        });
        this.d.mount(['eph-otherlistener', 'enter'], function (body) {
            s.pass('Called once');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['eph', 'enter', 'host'], ['eph-otherlistener']);
    });

});

