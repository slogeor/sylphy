/**
 * ajax
 */

var tool = window.S = window.S || {};

tool.ajax = {

    /**
     * ajax请求
     * @param  {string}   url      [url或路径]
     * @param  {Object}   data     [参数]
     * @param  {String}   type     [类型：get、post]
     * @param  {Function} callback [callback]
     */
    getAjax: function(url, data, type, callback) {
        $.ajax({
            url: url,
            type: type,
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
            cache: false,
            data: data,
            success: function(data) {
                callback && callback(data);
            }
        });
    },

    /**
     * jsonp,跨域请求
     * @param  {[type]}   url      [url]
     * @param  {[type]}   data     [data]
     * @param  {Function} callback [callback]
     */
    getJsonp: function(url, data, callback) {
        $.ajax({
            url: url,
            data: data,
            type: 'get',
            dataType: 'jsonp',
            jsonp: 'jsonpcallback',
            success: function(data) {
                callback && callback(data);
            }
        });
    }
};