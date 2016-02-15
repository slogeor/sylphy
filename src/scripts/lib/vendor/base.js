'use strict';
!(function(win) {
    var doc = win.document,
        element = doc.documentElement,
        baseWidth = 720,
        baseSize = baseWidth / 32,
        changeEv = 'orientationchange' in win ? 'orientationchange' : 'resize',
        size = function() {
            var clientW = element.clientWidth || 320;

            clientW = (clientW > 720) ? 720 : (clientW < 320) ? 320 : clientW;
            console.log(clientW / baseSize)
            element.style.fontSize = clientW / baseSize + 'px';
        };
    if (doc.addEventListener) {
        win.addEventListener(changeEv, size, false);
        // doc.addEventListener('DOMContentLoaded', size, false);
    }
    size();
})(window);