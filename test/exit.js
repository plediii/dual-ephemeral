"use strict";

var dualproto = require('dual-protocol');
var m = require('../index');
var test = require('tape');

test('dual-ephemeral exit', function (t) {
    var test = function (desc, f) {
        // before each
        var ctxt = {
            d: (dualproto.use(m))()
        };
        ctxt.d.ephemeral(['eph']);
        t.test(desc, f.bind(ctxt));
    };

    test('should have listeners for exit', function (s) {
        s.plan(1);
        this.d.send(['eph', 'register', 'host']);
        s.notEqual(0, this.d.listeners(['eph', 'exit', 'host']).length, 'there were no listeners for eph/exit');
    });

    test('should emit exit event when entered address exits', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body, ctxt) {
            s.pass('ephemeral exit event');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
    });

    test('should not emit exit event when non-entered address exit', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.fail('eph/removeNode emitted');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        s.pass('sent exit event');
    });

    test('should not emit exit event when non-registered address exit', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.fail('eph-listener event emitted');
        });
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        s.pass('sent enter/exit for unregistered host');
    });

    test('should not emit exit event when non-registered/entered address exit', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.fail('eph-listener/exit emitted');
        });
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        s.pass('sent exit event');
    });

    test('should not emit exit event on second exit', function (s) {
        s.plan(2);
        this.d.mount(['eph-listener', 'exit'], function (body, ctxt) {
            s.pass('ephemeral exit event');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        s.pass('Sent two exit events');
    });

    test('should emit exit on second exit if re-enter on exit', function (s) {
        s.plan(3);
        this.d.mount(['eph-listener', 'exit'], function (body, ctxt) {
            ctxt.send(['eph', 'enter', 'host'], ['eph-listener']);
            s.pass('ephemeral exit event');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        s.pass('Sent two exit events');
    });

    test('should emit exit event with enter body', function (s) {
        s.plan(2);
        this.d.mount(['eph-listener', 'exit'], function (body, ctxt) {
            s.equal(body, 'body');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener'], 'body');
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        s.pass('Sent exit and enter event with body');
    });

    test('should emit exit event with source route', function (s) {
        s.plan(2);
        this.d.mount(['eph-listener', 'exit'], function (body, ctxt) {
            s.deepEqual(['host'], ctxt.options.nodeRoute);
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener'], 'body');
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        s.pass('Sent exit and enter event with body');
    });


    test('should emit exit event with proper enter body (two hosts)', function (s) {
        s.plan(1);
        this.d.mount(['eph-otherlistener', 'exit'], function (body, ctxt) {
            s.equal(body, 'otherbody');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'register', 'otherhost']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener'], 'body');
        this.d.send(['eph', 'enter', 'otherhost'], ['eph-otherlistener'], 'otherbody');
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        this.d.send(['eph', 'exit', 'otherhost'], ['eph-otherlistener']);
    });

    test('should emit exit event with proper enter body (same host)', function (s) {
        s.plan(2);
        this.d.mount(['eph-otherlistener', 'exit'], function (body, ctxt) {
            s.equal(body, 'otherbody');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener'], 'body');
        this.d.send(['eph', 'enter', 'host'], ['eph-otherlistener'], 'otherbody');
        this.d.send(['eph', 'exit', 'host'], ['eph-otherlistener']);
        s.pass('Sent exit event for otherhost');
    });

    test('should emit enter twice on enter/exit/enter', function (s) {
        s.plan(3);
        this.d.mount(['eph-listener', 'enter'], function (body, ctxt) {
            s.pass('received ephemeral enter event');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        s.pass('sent enter/exit/enter');
    });
});

