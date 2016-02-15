 /**
  * 日期相关
  */

 var util = window.S = window.S || {};


 // 地区时区
 var UTC_MAP = {
   'in': 5.5,
   'tw': 8
 };


 // 工具包对象
 util.date = {
   /**
    * 获取时间
    * @param {String} time 时间戳
    * @return {Date} 日期
    * util.getUTCTime(1437530400000)
    */
   getUTCDate: function(time, nationCode) {
     var timeBasis = time,
       zoneNum = UTC_MAP[nationCode || XIAOMI.GLOBAL_CONFIG.appLocal.name] || 0,
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
     var dateBasis = new Date(dateStr),
       zoneNum = UTC_MAP[nationCode || XIAOMI.GLOBAL_CONFIG.appLocal.name] || 0,
       // 获取与格林威治标准时间 (GMT) 的分钟差
       timeZone = dateBasis.getTimezoneOffset(),
       // 毫秒差
       timeDis = (timeZone + zoneNum * 60) * 60 * 1000,
       // 时间戳
       time = dateBasis.getTime() - timeDis;
     return time;
   }
 };