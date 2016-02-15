/**
 * 通用的方法
 */

var tool = window.S = window.S || {};

tool.parser = {
    // 生成uuid
    uuid: function() {
        //生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },

    /**
     * 取接口返回数据中某个字段的值
     * @param {object} obj 接口数据
     * @param {string} paramLink 层级关系用.连接
     * @param defaultValue 类型填充
     */
    getJsonValue: function(obj, paramLink, defaultValue) {
        if (!paramLink) {
            return;
        }
        var parma = paramLink.split('.');

        var objectChecked = $.extend(true, {}, obj);

        for (var i = 0, len = parma.length; i < len; i++) {
            if (objectChecked.hasOwnProperty(parma[i])) {
                objectChecked = objectChecked[parma[i]];
            } else {
                // defaultValue 取值可能是false、0等
                return undefined || defaultValue;
            }
        }
        return objectChecked;
    },

    /**
     * 截取字符串
     * @param  {[string]} target
     * @param  {[number]} length
     * @param  {[string]} truncation
     */
    truncate: function(target, length, truncation) {
        //length，新字符串长度，truncation，新字符串的结尾的字段,返回新字符串
        length = length || 30;
        truncation = truncation === void(0) ? "..." : truncation;
        return target.length > length ? target.slice(0, length) + truncation : String(target);
    },
    /**
     * 格式化数字
     * @param  {[string]} str         输入
     * @param  {[number]} len         多少位分割
     * @param  {[string]} placeholder 占位符
     */
    formatNumber: function(str, len, placeholder) {
        var strLen = str.length,
            splitPos = parseInt(strLen / len, 10) * len,
            // 后半部分
            endStr = str.substring(splitPos, strLen),
            // 前部分
            preStr = str.substring(0, splitPos),
            res = [],
            // 正则模式
            patt = new RegExp('\\w{' + len + '}', 'gi');

        res = preStr.match(patt) || [preStr];

        res.push(endStr);

        return $.trim(res.join(placeholder || ''));
    },
};