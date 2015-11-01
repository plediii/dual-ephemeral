"use strict";

module.exports = function (Domain, libs) {
    var _ = libs._;
    Domain.prototype.ephemeral = function (route) {
        if (!_.isArray(route)) {
            route = ['ephemeral'];
        }
        var d = this;
        var nodeHandler = new Domain();
        d.mount(route, {
            register: {
                '::host': function (body, ctxt) {
                    var clientSubscriptions = new Domain();
                    var hostRoute = ctxt.params.host;
                    var enterRoute = route.concat(['enter']).concat(hostRoute)
                    var enterHandler = function (body, ctxt) {
                        var ephemeralGroup = ctxt.from;
                        if (clientSubscriptions.listeners(ephemeralGroup) < 1) {
                            clientSubscriptions.once(ephemeralGroup, function () {
                                ctxt.send(ephemeralGroup.concat('exit'), [], body, {
                                    nodeRoute: hostRoute
                                });
                            });
                            ctxt.send(ephemeralGroup.concat('enter'), [], body, {
                                nodeRoute: hostRoute
                            });
                        }
                    };
                    var exitRoute = route.concat(['exit']).concat(hostRoute)
                    var exitGroup = function (ephemeralGroup) {
                        clientSubscriptions.send(ephemeralGroup);
                    };
                    var exitHandler = function (body, ctxt) {
                        exitGroup(ctxt.from);
                    };
                    var disconnectRoute = ['disconnect'].concat(hostRoute);
                    var disconnectHandler = function (body, ctxt) {
                        exitGroup('**');
                    };
                    d.mount(enterRoute, enterHandler);
                    d.mount(exitRoute, exitHandler);
                    d.mount(disconnectRoute, disconnectHandler);
                }
            }
        });
    };
};
