/**
 * @description 倒计时
 * @author slogeor
 * @date 2015-03-22
 */
var time = {
  // 地区时区
  UTC_MAP: {
    'in': 5.5,
    'tw': 8,
    'hk': 8,
    'ch': 8
  },
  /**
   * 获取时间
   * @param {String} time 时间戳
   * @return {Date} 日期
   * util.getUTCTime(1437530400000)
   */
  getUTCDate: function(time, nationCode) {
    var _this = this;

    var timeBasis = time,
      zoneNum = _this.UTC_MAP[nationCode] || 0,
      dateBasis = new Date(timeBasis),

      // 获取与格林威治标准时间 (GMT) 的分钟差
      timeZone = dateBasis.getTimezoneOffset(),

      // 相差的毫秒
      timeDis = (timeZone + zoneNum * 60) * 60 * 1000,

      // 生成新的毫秒
      newTime = timeBasis + timeDis;

    return new Date(newTime);
  },

  /**
   * 获取时间戳
   * @param  {String} dateStr 日期字符串
   * @return {Number} time  毫秒
   * util.getUTCTime('2015/07/28 16:30:00') 
   */
  getUTCTime: function(dateStr, nationCode) {
    var _this = this;

    var dateBasis = new Date(dateStr),
      zoneNum = _this.UTC_MAP[nationCode] || 0,

      // 获取与格林威治标准时间 (GMT) 的分钟差
      timeZone = dateBasis.getTimezoneOffset(),

      // 毫秒差
      timeDis = (timeZone + zoneNum * 60) * 60 * 1000,

      // 时间戳
      time = dateBasis.getTime() - timeDis;

    return time;
  },

  /**
   * 倒计时
   * @param  {String}    nationCode 国家码
   * @param  {String}    startDate 开始的时间
   * @param  {String}    endDate 结束的时间
   * @param  {Boolean}   supportDay 是否支持天， 1: 支持, 0:不支持
   * @param  {function}  continueCB  回调函数
   * @param  {function}  endCB  倒计时结束回调函数
   * getCountDown('in', '2015/07/02 10:00:00', '2015/08/02 10:00:00', 1, continueCB, endCB);
   */
  getCountDown: function(option) {
    // 初始化
    var defaultOption = {
      nationCode: undefined,
      startDate: undefined,
      endDate: undefined,
      supportDay: 1,
      continueCB: function() {},
      endCB: function() {}
    };

    //更新值
    var param = $.extend(true, defaultOption, option);

    // 请求服务器时间的url
    var timeDiff = 0,
      endTime = this.getUTCTime(param.endDate, param.nationCode) / 1000;
    // console.log(endTime)

    //没有指定开始时间，接口获取  
    if (!param.startDate) {
      window.servertime = parseInt(new Date().getTime() / 1000);
    } else {
      servertime = this.getUTCTime(param.startDate, param.nationCode) / 1000;
    }

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
    }

    // 倒计时字符串
    function countDown() {
      var surplusTime = endTime - servertime;

      if (surplusTime > 0) {
        // console.log(surplusTime)
        // 倒计时继续
        var second = Math.floor(surplusTime % 60),
          minute = Math.floor((surplusTime / 60) % 60),
          hour = Math.floor((surplusTime / 3600) % 24),
          day = Math.floor((surplusTime / 86400) % 30);
        servertime++;

        var timeObj = formatTime(day, hour, minute, second);
        param.continueCB(timeObj);
      } else {
        // 结束倒计时
        param.endCB();
        // 清除倒计时
        clearInterval(window.countDownTimer);
      }
    }

    //格式化时间字符串
    function formatTime(day, hour, minute, second) {
      // 时间对象
      var timeObj = {
        day: '',
        hour: '',
        minute: '',
        second: ''
      };

      //添加0
      var addZero = function(number) {
        return ('0' + number).length > 2 ? number : '0' + number;
      };

      //赋值
      if (param.supportDay === 1) {
        // 支持天
        if (day !== 0) {
          timeObj.day = addZero(day);
        }
      } else {
        hour += addZero(day * 24);
      }

      if (!timeObj.day) {
        delete timeObj.day;
      }

      timeObj.hour = addZero(hour);
      timeObj.minute = addZero(minute);
      timeObj.second = addZero(second);

      return timeObj;
    }
  },

  /**
   * 一分钟倒计时
   * startCB: 开始回调
   * endCB: 结束回调
   */
  minTimer: function(option) {
    var defaultOption = {
        'continueCB': undefined,
        'endCB': undefined
      },
      leftTime = 60;

    var param = $.extend(true, defaultOption, option);

    window.countDownMinTimer = setInterval(function() {
      if (leftTime-- > 0) {
        param.continueCB(leftTime);
      } else {
        param.endCB();
      }
    }, 1000);
  }
};