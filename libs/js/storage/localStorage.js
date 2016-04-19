/**
 * @description 本地存储
 * @author slogeor
 * @date 2016-04-07
 */
function Storage(options) {
  //代理对象，默认为localstorage
  this.sProxy = window.localStorage;
}

Storage.prototype = {
  constructor: Storage,
  /**
   * 获取指定key 的取值
   * @param key
   */
  get: function(key) {
    var now = new Date().getTime(),
      result = '';
    try {
      result = this.sProxy.getItem(key);

      if (!result) return null;

      //解析json
      result = $.parseJSON(result);

      //数据过期
      if (result.timeout < now) {
        //删除
        this.remove(key);
        return null;
      }

      return result.value;
    } catch (e) {
      throw Error('localStorage undefined');
    }
    return null;
  },

  /**
   * 添加缓存
   * @param key
   * @sMap {
   *  @param value 取值
   *  @param timeout 时间戳
   *  @param updateTime [true: 更新时间戳，false:不更新]
   * }
   * @return non
   */
  set: function(key, sMap) {
    if (!key) return;
    try {
      //判断是否已存在
      var oldMap = this.sProxy.getItem(key);

      if (oldMap) {
        //更新
        this.update(key, sMap);
      } else {
        //设置有效期
        sMap.timeout = new Date().getTime() + sMap.timeout;

        this.sProxy.setItem(key, JSON.stringify(sMap));
      }
    } catch (e) {
      throw Error('localStorage undefined');
    }
  },

  /**
   * 更新缓存
   * @param key
   * @sMap {
   *  @param value 取值
   *  @param timeout 时间戳
   *  @param updateTime [true: 更新时间戳，false:不更新]
   * }
   * @return non
   */
  update: function(key, sMap) {
    try {
      if (sMap.updateTime) {
        //全量更新

        //设置有效期
        sMap.timeout = new Date().getTime() + sMap.timeout;

        this.sProxy.setItem(key, JSON.stringify(sMap));
      } else {
        //不更新时间
        var oldMap = this.sProxy.getItem(key);
        var newMap = $.extend(true, {}, sMap);
        newMap.timeout = sMap.timeout;
        this.sProxy.setItem(key, JSON.stringify(newMap));
      }
    } catch (e) {
      throw Error('localStorage undefined');
    }
  },

  /**
   * 删除缓存
   * @param key
   * @return non
   */
  remove: function(key) {
    if (!key) return;
    try {
      this.sProxy.removeItem(key);
    } catch (e) {
      throw Error('localStorage undefined');
    }
  },

  /**
   * 清空缓存
   * @return non
   */
  clear: function() {
    try {
      this.sProxy.clear();
    } catch (e) {
      throw Error('localStorage undefined');
    }
  }
};

Storage.getInstance = function() {
  if (!this.instance) {
    this.instance = new this();
  }

  return this.instance;
};

window.storage = Storage.getInstance();

//TODO
//1. 个数限制