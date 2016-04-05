### 一些说明

Q：html5 video “ended” event not working in chrome and IE ?

A：Your test page isn't live anymore, so I can't check this, but I found that if looping is enabled for the tag (e.g., <video loop="loop">), the "ended" event wasn't firing in Chrome or IE (I didn't test in Firefox). Once I removed the loop attribute, the "ended" event fired in both browsers.

Remove the loop attribute if you want the 'ended' event to fire...

<a href="http://stackoverflow.com/questions/8153703/html5-video-ended-event-not-working-in-chrome-and-ie">click</a>