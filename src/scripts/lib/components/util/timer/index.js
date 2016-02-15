 /**
  * 倒计时
  */

 var util = window.S = window.S || {};

 util.timer = {
   /**
    * 倒计时
    */
   getTimer: function(obj, options) {
     var settings = {
       time: 60,
       disabled: 'disabled',
       text: 'Resend after %1s '
     };
     settings = $.extend(settings, options || {});
     var $obj = $(obj),
       sourceVal = $obj.val(),
       sourceHtml = sourceVal ? sourceVal : $obj.html(),
       text = settings.text.replace('%1', settings.time),
       writeIn = function(content) {
         if (sourceVal) {
           $obj.val(content);
         } else {
           $obj.html(content);
         }
       },
       countDown = function() {
         if (settings.time > 0) {
           settings.time--;
           text = settings.text.replace('%1', settings.time);
           writeIn(text);
         } else {
           writeIn(sourceHtml);
           $obj.removeClass(settings.disabled);
           clearInterval(window.xmCountDownTimer);
         }
       };
     if (window.xmCountDownTimer) {
       clearInterval(window.xmCountDownTimer);
     }
     window.xmCountDownTimer = setInterval(function() {
       countDown();
     }, 1000);
     $obj.addClass(settings.disabled);
     writeIn(text);
   },

   /**
   * 获取化倒计时
   * @param  {String}    nationCode 国家码
   * @param  {String}    endDate 结束的时间
   * @param  {Boolean}   supportDay 是否支持天， 1: 支持, 0:不支持
   * @param  {function}  callBack  回调函数
   * @param  {function}  endCallBack  倒计时结束回调函数
   * getCountDown('in', '2015/08/02 10:00:00', 1, callBack, endCallBack);
   */
  getCountDown: function(nationCode, endDate, supportDay, callBack, endCallBack) {
    // 请求服务器时间的url
    var url = XIAOMI.GLOBAL_CONFIG.damiaoSite + '/gettimestamp?_=' + new Date().getTime(),
      timeDiff = 0,
      endTime = this.getUTCTime(endDate, nationCode) / 1000;

    //获取时间戳 
    $.ajax({
      type: "GET",
      url: url,
      dataType: "jsonp",
      // jsonpCallback:"resetServerTime",
      error: function() {},
      success: function(data) {}
    });

    // 定时器
    window.listenServerTime = setInterval(function() {
      if (typeof(servertime) !== 'undefined' && servertime) {
        var localTime = parseInt(new Date().getTime() / 1000);

        // 获取时间差
        timeDiff = servertime - localTime;

        // 轮询
        checkTime();

        //清除超时定时器   
        clearInterval(window.listenServerTime);
        clearTimeout(window.listenTimeout);
      }
    }, 200);

    // 获取时间戳超时
    window.listenTimeout = setTimeout(function() {
      clearInterval(window.listenServerTime);

      // 获取不到服务器时间，以本地时间为准
      servertime = new Date().getTime() / 1000;
      checkTime();
    }, 5000);

    // 轮询
    function checkTime() {
      window.countDownTimer = setInterval(function() {
        servertime = parseInt(new Date().getTime() / 1000) + timeDiff;
        countDown();
      }, 1000);
    };

    // 倒计时字符串
    function countDown() {
      var surplusTime = endTime - servertime;

      if (surplusTime > 0) {
        // 倒计时继续
        var second = Math.floor(surplusTime % 60),
          minite = Math.floor((surplusTime / 60) % 60),
          hour = Math.floor((surplusTime / 3600) % 24),
          day = Math.floor((surplusTime / 86400) % 30);
        servertime++;

        var timeHtml = formatTime(day, hour, minite, second);
        callBack(timeHtml);
      } else {
        // 结束倒计时
        endCallBack();
        // 清除倒计时
        clearInterval(window.countDownTimer);
      }
    };

    function formatTime(day, hour, minite, second) {
      var timeText = [];
      if (supportDay === 1) {
        // 支持天
        if (day !== 0) {
          timeText.push(day + 'd')
        }
      } else {
        hour += day * 24;
      }
      timeText.push(hour + 'h')
      timeText.push(minite + 'm')
      timeText.push(second + 's')
      return timeText.join(': ')
    };
  }
 };