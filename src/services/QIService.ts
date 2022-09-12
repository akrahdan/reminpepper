import { MemoryEventSubscription } from "./memoryEvent";
export const QIService = () => {
  let Qisession: any = null;

  // window.QiSession.connect(function (session) {
  //     session.service()
  // })

  const subscribeToALMemoryEvent = function(event, eventCallback, subscribeDoneCallback) {
    var evt = new MemoryEventSubscription(event);
    onService("ALMemory", (ALMemory) => {
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
  const onService = (serviceName: string, callback, errorCallback) => {
    connect((session) => {
      session.service(serviceName).then(
        (service) => {
          callback(service);
        },
        () => {
          var reason = "Failed getting a NaoQi Module: " + serviceName;
          console.log(reason);
          if (errorCallback) {
            errorCallback(reason);
          }
        }
      );
    }, errorCallback);
  };

  const connect = (connectedCallback, failureCallback) => {
    if (Qisession) {
      // We already have a session, don't create a new one
      connectedCallback(Qisession);
      return;
    } else if (pendingConnectionCallbacks.length > 0) {
      // A connection attempt is in progress, just add this callback to the queue
      pendingConnectionCallbacks.push(connectedCallback);
      return;
    } else {
      // Add self to the queue, but create a new connection.
      pendingConnectionCallbacks.push(connectedCallback);
    }

    function onConnected(ses) {
      Qisession = ses;
      var numCallbacks = pendingConnectionCallbacks.length;
      for (var i = 0; i < numCallbacks; i++) {
        pendingConnectionCallbacks[i](Qisession);
      }
    }

    window.QiSession(onConnected, failureCallback);
  };

  var onALMemoryError = function (errMsg) {
    console.log("ALMemory error: " + errMsg);
  };

  var pendingConnectionCallbacks = [];


  return {
    subscribeToALMemoryEvent,
    onService
  }
};

export const QiRoboService = QIService()
