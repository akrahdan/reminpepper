export class MemoryEventSubscription {
    constructor(event) {
        this._event = event;
        this._internalId = null;
        this._sub = null;
        this._unsubscribe = false;
    }
   
}

MemoryEventSubscription.prototype.setId = function(id) {
    this._internalId = id;
    // as id can be receveid after unsubscribe call, defere
    if (this._unsubscribe) this.unsubscribe(this._unsubscribeCallback);
}

MemoryEventSubscription.prototype.setSubscriber = function(sub) {
    this._sub = sub;
    // as sub can be receveid after unsubscribe call, defere
    if (this._unsubscribe) this.unsubscribe(this._unsubscribeCallback);
}

MemoryEventSubscription.prototype.unsubscribe = function(unsubscribeDoneCallback)
{
    if (this._internalId != null && this._sub != null) {
        var evtSubscription = this;
        evtSubscription._sub.signal.disconnect(evtSubscription._internalId).then(function() {
            if (unsubscribeDoneCallback) unsubscribeDoneCallback();
        }).fail(onALMemoryError);
    }
    else
    {
        this._unsubscribe = true;
        this._unsubscribeCallback = unsubscribeDoneCallback;
    }
}

var onALMemoryError = function(errMsg) {
    console.log("ALMemory error: " + errMsg);
}

var pendingConnectionCallbacks = [];


export function getScript(source, successCallback, failureCallback) {
    var script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = !!1;
    prior.parentNode.insertBefore(script, prior);

    script.onload = script.onreadystatechange = function( _, isAbort ) {
        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if(isAbort) {
                if (failureCallback) failureCallback();
            } else {
                // Success!
                if (successCallback) successCallback();
            }
        }
    };

    script.src = source;
}     
