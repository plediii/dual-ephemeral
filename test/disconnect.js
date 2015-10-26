"use strict";

var _ = require('lodash');
var dualproto = require('dual-protocol');
var m = require('../index');
var test = require('tape');

test('dual-ephemeral disconnect', function (t) {
    var test = function (desc, f) {
        // before each
        var ctxt = {
            d: (dualproto.use(m))()
        };
        ctxt.d.ephemeral(['eph']);
        t.test(desc, f.bind(ctxt));
    };

    test('should have listeners for disconnect', function (s) {
        s.plan(1);
        this.d.send(['eph', 'register', 'host']);
        s.notEqual(0, this.d.listeners(['disconnect', 'host']).length, 'there were no listeners for disconnect/host');
    });

    test('should emit exit when entered address disconnects', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.pass('exit emitted');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['disconnect', 'host']);
    });

    test('should emit exit for every entered group when host address disconnects', function (s) {
        s.plan(2);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.pass('exit emitted');
        });
        this.d.mount(['eph-otherlistener', 'exit'], function (body) {
            s.pass('other listener exit emitted');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['eph', 'enter', 'host'], ['eph-otherlistener']);
        this.d.send(['disconnect', 'host']);
    });

    test('should not emit exit when non-entered address disconnects', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.fail('eph/removeNode emitted');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['disconnect', 'host']);
        s.pass('emitted disconnect');
    });

    test('should not emit exit when non-registered address disconnects', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.fail('eph-listener exit emitted');
        });
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['disconnect', 'host']);
        s.pass('emitted disconnect');
    });

    test('should not emit exit when non-registered/entered address disconnects', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.fail('eph/removeNode emitted');
        });
        this.d.send(['disconnect', 'host']);
        s.pass('emitted disconnect');
    });

    test('should not emit exit on exit after disconnect', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.pass('eph/removeNode emitted');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['disconnect', 'host']);
        this.d.send(['eph', 'exit', 'host']);
    });

    test('should not emit exit on disconnect after exit', function (s) {
        s.plan(2);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.pass('eph exit emitted');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['eph', 'exit', 'host'], ['eph-listener']);
        this.d.send(['disconnect', 'host']);
        s.pass('emitted exit then disconnect');
    });

    test('should not emit exit on disconnect after disconnect', function (s) {
        s.plan(2);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.pass('eph exit emitted');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['disconnect', 'host']);
        this.d.send(['disconnect', 'host']);
        s.pass('emitted exit then disconnect');
    });

    test('should not emit removeNode on disconnect after disconnect', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.pass('eph/removeNode emitted');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener']);
        this.d.send(['disconnect', 'host']);
        this.d.send(['disconnect', 'host']);
    });

    test('should emit exit with enter body', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'exit'], function (body) {
            s.equal(body, 'body');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener'], 'body');
        this.d.send(['disconnect', 'host']);
    });

    test('should emit exit with proper enter body', function (s) {
        s.plan(3);
        this.d.mount(['eph-listener', 'exit'], function (body, ctxt) {
            console.log(ctxt.options);
            if (_.isEqual(ctxt.options.nodeRoute, ['host'])) {
                s.equal('body', body);
            } else {
                s.equal('otherbody', body);
            }
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['eph', 'register', 'otherhost']);
        this.d.send(['eph', 'enter', 'host'], ['eph-listener'], 'body');
        this.d.send(['eph', 'enter', 'otherhost'], ['eph-listener'], 'otherbody');
        this.d.send(['disconnect', 'host']);
        this.d.send(['disconnect', 'otherhost']);
        s.pass('disconnected both hosts');
    });

    test('should require disconnected souces to re-register', function (s) {
        s.plan(1);
        this.d.mount(['eph-listener', 'enter'], function (body) {
            s.fail('Enter after disconnect ');
        });
        this.d.send(['eph', 'register', 'host']);
        this.d.send(['disconnect', 'host']);
        this.d.send(['eph', 'enter', 'host']);
        s.pass('disconnected host ');
    });
});

