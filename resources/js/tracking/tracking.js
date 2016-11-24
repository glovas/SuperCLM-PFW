(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.jQuery);
    }
}(this, function ($) {
    var latitude = null;
    var longitude = null;

    /**
     * Constructor function to initialize the variables
     */
    (function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            });
        }
    })();

    function getSendDataTemplate() {
        var data = {
            uid : window.SuperCLM.uid,
            presentation_id : window.SuperCLM.presentationId,
            latitude : latitude,
            longitude : longitude,
            positionX : 0,
            positionY : 0,
            windowWidth: window.outerWidth,
            windowHeight: window.outerHeight,
            targetId : '',
            targetTitle : '',
            body : '',
            time : new Date().getTime()/1000,
            type : 'OPEN'
        };
        return $.extend({}, data);
    }

    function storeOfflineEvents(data) {
        if(localStorage){
            var trackEventQueue = JSON.parse(localStorage.getItem('superClmEventQueue'));
            if(!trackEventQueue) {
                trackEventQueue = [];
            }
            trackEventQueue.push(data);
            localStorage.setItem('superClmEventQueue', JSON.stringify(trackEventQueue));
        }
    }

    function sendData(data) {
        if(navigator.onLine) {
            $.get(window.SuperCLM.trackingUrl, data)
                .done(function () {
                    // Yaay successfully stored event
                })
                .fail(function (e) {
                    if(e.status != 404 && e.status != 403) {
                        storeOfflineEvents(data);
                    }
                });
        }
        else {
            storeOfflineEvents(data);
        }
    }

    function trackCustomEvent(targetId, targetTitle, body) {
        var dataToSend = getSendDataTemplate();
        dataToSend.type = "CUSTOM";
        dataToSend.body = JSON.stringify(body);
        dataToSend.targetId = targetId;
        dataToSend.targetTitle = targetTitle;
        sendData(dataToSend);
    }

    function sendOpenEvent() {
        var dataToSend = getSendDataTemplate();
        dataToSend.type = "OPEN";
        sendData(dataToSend);
    }

    function sendCloseEvent() {
        var dataToSend = getSendDataTemplate();
        dataToSend.type = "CLOSE";
        sendData(dataToSend);
    }

    function itemClickEvent (e) {
        var item = $(this);
        var dataToSend = getSendDataTemplate();
        dataToSend.type = "ACTION";
        dataToSend.targetTitle = item[0].title;
        dataToSend.targetId = item[0].id;
        dataToSend.positionX = e.pageX - item.offset().left;
        dataToSend.positionY = e.pageY - item.offset().top;
        sendData(dataToSend);
    }

    function sendOfflineEventOnOnline() {
        if(localStorage && navigator.onLine){
            var trackEventQueue = JSON.parse(localStorage.getItem('superClmEventQueue'));
            if(!trackEventQueue) {
                return;
            }
            localStorage.setItem('superClmEventQueue', JSON.stringify([]));
            while(trackEventQueue.length > 0) {
                var dataToSend = trackEventQueue.pop();
                sendData(dataToSend);
            }
        }
    }
    function init() {
        sendOpenEvent();
        window.onbeforeunload = sendCloseEvent;
        $('[id]').click(itemClickEvent);
        window.addEventListener('online',  sendOfflineEventOnOnline);
    }

    window.tracking = {
        trackCustomEvent: trackCustomEvent,
        init: init
    };
    return window.tracking;
}));