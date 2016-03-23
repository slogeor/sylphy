# timer(倒计时)

## 方法列表

| 方法名    | 参数名  | 描述       |  
|:---------|:-------|:-------   |
| init     | Object | 倒计时     | 
| minTimer | Object | 一分钟倒计时| 


##  init

### 输入

| 参数名       | 参数名    | 描述           |  默认值 ｜ 
|:----------- |:---------|:--------------|:--------|
| startTime   | Number   | 开始时间       | 当前时间| 
| endTime     | Number   | 结束时间       | 无      |
| supportDay  | Boolean  | 是否支持天     | true    |
| supportZero | Boolean  | 是否支持零前缀  | true    |
| timerTitle  | Array    | 时间title     | ['d','h','m','s']|
| separate    | String   | 时间分割符     | :       |
| startCB     | Function | 开始回调函数   | 空函数   |
| endCB       | Function | 结束回调函数   | 空函数   |

### 默认值详细说明

    * startTime    开始时间 new Date().getTime() / 1000
    * endTime      结束时间
    * supportDay   是否支持天， true: 支持, false:不支持
    * supportZero  是否支持时间为个位数前面加0， ture: 支持, false: 不支持
    * timerTitle   时间title
    * separate     分割符
    * startCB      回调函数
    * endCB        倒计时结束回调函数

### 输出参数说明

| 参数名          | 参数名    | 描述           |  
|:---------------|:---------|:--------------|
| entireTimerArr | Array    | 完整倒计时数组  | 
| entireTimerStr | String   | 完整倒计时字符  | 
| simpleTimerArr | Array    | 简单倒计时数组  | 
| simpleTimerStr | String   | 简单倒计时字符串 | 

### 调用方式
```js
  //虚拟模拟require
  var timer = requier('./timer/index.js');
  var option = {
    startTime: new Date('2015-11-04 18:29:55').getTime()/1000,
    endTime: new Date('2015-11-04 18:30:00').getTime()/1000,
    startCB: function(obj){
      console.log(obj.entireTimerArr);
      console.log(obj.entireTimerStr);
      console.log(obj.simpleTimerArr);
      console.log(obj.simpleTimerStr);
    },
    endCB: function(){},
 };
 
 timer.init(option)
```

## minTimer(obj)

    *输入: Object
    *obj: {
        startCB: 倒计时继续CB
        endCB: 倒计时结束
    *}
    *调用: timer.minTimer(obj)