import { MemoryEventSubscription } from "./memoryEvent";
import { getScript } from "./memoryEvent";
const RobotMessagingService = () => {
   
  
    const onServices = (servicesCallback, errorCallback = null) => {
        connect(function(session) {
            var wantedServices = getParamNames(servicesCallback);
            var pendingServices = wantedServices.length;
            var services = new Array(wantedServices.length);
            var i;
            for (i = 0; i < wantedServices.length; i++) {
                (function (i){
                    session.service(wantedServices[i]).then(function(service) {
                        services[i] = service;
                        pendingServices -= 1;
                        if (pendingServices == 0) {
                            servicesCallback.apply(undefined, services);
                        }
                    }, function() {
                        var reason = "Failed getting a NaoQi Module: " + wantedServices[i]
                        console.log(reason);
                        if (errorCallback) {
                            errorCallback(reason);
                        }
                    });
                })(i);
            }
        }, errorCallback);
    }
    
    // alias, so that the code looks natural when there is only one service.
    const onService = onServices;

    /* RobotUtils.subscribeToALMemoryEvent(event, eventCallback, subscribeDoneCallback)
     *
     * connects a callback to an ALMemory event. Returns a MemoryEventSubscription.
     * 
     * This is just syntactic sugar over calls to the ALMemory service, which you can
     * do yourself if you want finer control.
     */
    const subscribeToALMemoryEvent = function(event, eventCallback, subscribeDoneCallback) {
        var evt = new MemoryEventSubscription(event);
        onServices(function(ALMemory) {
            ALMemory.subscriber(event).then(function (sub) {
                evt.setSubscriber(sub)
                sub.signal.connect(eventCallback).then(function(id) {
                    evt.setId(id);
                    if (subscribeDoneCallback) subscribeDoneCallback(id)
                });
            },
            onALMemoryError);
        }, null);
        return evt;
    }

    /* RobotUtils.connect(connectedCallback, failureCallback)
     * 
     * connectedCallback should take a single argument, a NAOqi session object
     * 
     * This function is mostly meant for intenral use, for your app you
     * should probably use the more specific RobotUtils.onServices or
     * RobotUtils.subscribeToALMemoryEvent.
     *
     * There can be several calls to .connect() in parallel, only one
     * session will be created.
     */
    const connect = function(connectedCallback, failureCallback) {
        if (session) {
            // We already have a session, don't create a new one
            connectedCallback(session);
            return;
        }
        else if (pendingConnectionCallbacks.length > 0) {
            // A connection attempt is in progress, just add this callback to the queue
            pendingConnectionCallbacks.push(connectedCallback);
            return;
        }
        else {
            // Add self to the queue, but create a new connection.
            pendingConnectionCallbacks.push(connectedCallback);
        }
        
        var qimAddress = null;
        var robotlibs = '/libs/';
        if (robotIp) {
            // Special case: we're doing remote debugging on a robot.
            robotlibs = "http://" + robotIp + "/libs/";
            qimAddress = robotIp + ":80";
        }

        function onConnected(ses) {
            session = ses;
            var numCallbacks = pendingConnectionCallbacks.length;
            for (var i = 0; i < numCallbacks; i++) {
                pendingConnectionCallbacks[i](session);
            }
        }

        getScript(robotlibs + 'qimessaging/2/qimessaging.js', function() {
            window.QiSession(
                onConnected,
                failureCallback,
                qimAddress
            )
        }, function() {
            if (robotIp) {
                console.error("Failed to get qimessaging.js from robot: " + robotIp);
            } else {
                console.error("Failed to get qimessaging.js from this domain; host this app on a robot or add a ?robot=MY-ROBOT-IP to the URL.");
            }
            failureCallback();
        });
    }

    // public variables that can be useful.
    const robotIp = _getRobotIp();
    let session = null;

   
    
    function _getRobotIp() {
        var regex = new RegExp("[\\?&]robot=([^&#]*)");
        var results = regex.exec(window.location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " ").replace("/", ""));
    }

    // Helper for getting the parameters from a function.
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    function getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
        if(result === null)
            result = [];
        return result;
    };

    
    var onALMemoryError = function(errMsg) {
        console.log("ALMemory error: " + errMsg);
    }

    var pendingConnectionCallbacks = [];

    return {
        onService,
        onServices,
        robotIp,
        connect,
        subscribeToALMemoryEvent,

    }

    
}

export const RobotService = RobotMessagingService();


