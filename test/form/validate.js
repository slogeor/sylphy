/**
 * @description form表单校验
 * @author slogeor
 * @date 2015-11-09
 */
'use strict';
(function($) {
    /**
     * 表单校验默认配置
     */
    var objParam = {
        /**
         * submit按钮可用
         * @map {
         *  true: 开启
         *  false: 禁用
         * }
         */
        submitEnabled: false,

        /**
         * 表单验证方式
         * @map {
         *  ture: 即实验证
         *  false: 提交验证
         * }
         */
        validateMode: true,

        //form表单id
        formId: undefined,

        /**
         * 错误提示方式
         * @map {
         *  true: '下方'
         *  false: 悬浮
         * }
         */
        errorMode: true,

        // input绑定的class
        className: '.validate',

        //btn class
        btnClass: '.valid-submit',

        //error class        
        errorClass: '.valid-error',

        // 额外的其他验证
        extValidate: function() {
            return true;
        },

        fnCB: function() {

        }
    };

    /**
     * 默认正则校验
     * email: 邮箱
     * number: 数字
     * ulr: url地址
     * tel: 电话号码
     * zipcode: code
     * string: 默认的，非空
     */
    var objReg = {
        'email': '^[a-z0-9._%-]+@([a-z0-9-]+\\.)+[a-z]{2,4}$',
        'number': '^\\-?\\d+(\\.\\d+)?$',
        'url': '^(http|https|ftp)\\:\\/\\/[a-z0-9\\-\\.]+\\.[a-z]{2,3}(:[a-z0-9]*)?\\/?([a-z0-9\\-\\._\\?\\,\\\'\\/\\\\\\+&amp;%\\$#\\=~])*$',
        'tel': '^1\\d{10}$',
        'zipcode': '^\\d{6}$',
        'string': '\\w+',
        'pattern': undefined
    };

    /**
     * 校验规则
     * required: 必填
     * norequired: 非必填
     * minlength: 最小长度
     * maxlength: 最大长度
     * lengths: 长度,+s 方便正则处理
     * max: 最大值, number才有效
     * min: 最小值, number才有效
     */
    var objRules = {
        'required': '^.+$',
        'norequired': '^.*$',
        'minlength': undefined,
        'maxlength': undefined,
        'lengths': undefined,
        'max': undefined,
        'min': undefined
    };

    /**
     * 重置配置参数
     * @param  {Object}   objParam  [配置参数]
     * @param  {Object}   objReg    [正则参数]
     */
    $.fn.resetParam = function(param) {
        objParam = $.extend({}, objParam, param || {});

        // 优先级
        objParam.validateMode ? objParam.submitEnabled = false : objParam.submitEnabled = true;
        return $(this);
    };

    //resete  正则
    $.fn.resetReg = function(param) {
        objReg = $.extend({}, objReg, param || {});
        return $(this);
    };

    /**
     * 表单submit校验
     * @param {Function} fn          callback
     * @param {Function} extValidate 额外验证
     */
    $.fn.validateAll = function(factory) {
        var type = $.util.type(factory).toLowerCase();

        //参数类型判断
        if (type === 'object') {
            objParam.fnCB = factory.fnCB;
            objParam.extValidate = factory.extValidate;
        } else if (type === 'function') {
            objParam.fnCB = factory;
        }

        //更新formId
        objParam.formId = '#' + $(this).closest('form').attr('id');

        //submit按钮可用性
        var $btnId = $(objParam.formId).find(objParam.btnClass);
        objParam.submitEnabled ? $btnId.removeAttr('disabled') : $btnId.attr('disabled', true);

        //验证方式
        objParam.validateMode ? $.validate.validateInputEvent() : $.validate.validateForm();
    };

    //校验
    $.validate = (function() {
        return {
            //事件入口
            validateInputEvent: function() {
                // input事件
                $(objParam.formId).on('input', objParam.className, function() {
                    /**
                     * type: input类型
                     * rules: 校验规则
                     * pattern: 正则规则
                     * value: input值
                     */
                    var type = $(this).data('valid-type'),
                        rules = $(this).data('valid-rules'),
                        pattern = $(this).data('valid-pattern'),
                        value = $.trim($(this).val());

                    type = type ? type.toLowerCase() : '';
                    rules = rules ? rules.toLowerCase() : '';

                    // 最大长度处理
                    var regRes = rules.match(/maxlength_(\d+)$/i);
                    regRes && regRes[1] && $(this).attr('maxlength', regRes[1]);

                    // 固定长度处理
                    var lenRes = rules.match(/lengths_(\d+)$/i);
                    lenRes && lenRes[1] && $(this).attr('maxlength', lenRes[1]);

                    //错误信息->hide
                    $(this).parent().find(objParam.errorClass).hide();

                    /**
                     * 规则校验
                     * 1: 通过
                     * 0: 未通过，显示错误
                     * -1: 未通过，不显示错误
                     */
                    var inputState = $.validate.validateInput({
                        'pattern': pattern,
                        'type': type,
                        'rules': rules,
                        'value': value
                    });
                    $(this).data('valid-state', inputState);

                    // 回调参数
                    var formState = false;
                    
                    // btn选择器
                    var $btnId = $(objParam.formId).find(objParam.btnClass);
                    // console.log(inputState);
                    if (inputState === 0) {
                        //禁用按钮
                        !objParam.submitEnabled && $($btnId).attr('disabled', true);

                        //错误信息
                        if (objParam.errorMode) {
                            var $errorId = $(this).parent().find(objParam.errorClass);
                            //错误信息
                            if (!$.trim($($errorId).html())) {
                                var msg = $(this).data('valid-msg') || 'error';
                                $($errorId).html(msg).show();
                            } else {
                                $($errorId).show();
                            }
                        } else {
                            //悬浮 TODO
                        }
                    } else if (inputState === 1) {
                        //全局校验
                        formState = $.validate.validateState() && objParam.extValidate();
                        // 按钮
                        if (!objParam.submitEnabled) {
                            formState && $(objParam.formId).find(objParam.errorClass).hide();
                            formState ? $($btnId).removeAttr('disabled') : $($btnId).attr('disabled', true);
                        }
                    }
                    objParam.fnCB(formState);
                });

                //blur事件
                $(objParam.formId).on('blur', objParam.className, function() {
                    if ($(this).data('valid-state') === -1) {
                        if (objParam.errorMode) {
                            var $errorId = $(this).parent().find(objParam.errorClass);
                            //错误信息
                            if (!$.trim($($errorId).html())) {
                                var msg = $(this).data('valid-msg') || 'error';
                                $($errorId).html(msg).show();
                            } else {
                                $($errorId).show();
                            }
                        } else {
                            //悬浮 TODO
                        }
                    }
                });

                // radio、checkbox
                var checkbox = $(objParam.formId).find('input[type=\'checkbox\']'),
                    radio = $(objParam.formId).find('input[type=\'radio\']');
                (checkbox || radio) && $.validate.validateCheckEvent();
            },

            //radio、checkbox
            validateCheckEvent: function() {
                var formState = false;
                //单选、多选
                $(objParam.formId).on('click', 'input', function() {
                    var type = $(this).attr('type');
                    var $id = $(this).parent().find(objParam.className);

                    if (type === 'radio') {
                        // 单选
                        $id.data('valid-state', 1);
                    } else if (type === 'checkbox') {
                        //多选
                        var len = $('input[type=\'checkbox\']:checked').length;

                        // 默认是必选的
                        var rule = $id.data('valid-rules');

                        rule === 'norequired' ? $id.data('valid-state', 1) : $id.data('valid-state', len > 0 ? 1 : 0);
                    }

                    if (objParam.validateMode) {
                        // 即时校验
                        //全局校验
                        formState = $.validate.validateState() && objParam.extValidate();

                        var $btnId = $(objParam.formId).find(objParam.btnClass);

                        if (!objParam.submitEnabled) {
                            formState && $(objParam.formId).find(objParam.errorClass).hide();
                            formState ? $($btnId).removeAttr('disabled') : $($btnId).attr('disabled', true);
                        }
                    }

                    objParam.fnCB(formState);
                });
            },

            /**
             * 校验
             */
            validateInput: function(param) {
                /**
                 * type: 文本类型
                 * rules: 校验规则
                 * value: value值
                 * flag: 校验状态
                 * regExg: 正则
                 * len: 文本长度
                 */
                var type = param.type,
                    rules = param.rules,
                    value = param.value,
                    pattern = param.pattern,
                    flag = 1,
                    regExp = '',
                    strLen = value.length;

                if (type === 'pattern') {
                    pattern = pattern.slice(1, pattern.length - 1);
                    regExp = new RegExp(pattern + '', 'gim');
                } else {
                    regExp = new RegExp(objReg[type], 'gim');
                }

                //空
                if (!value && !!~rules.indexOf('norequired')) {
                    return 1;
                }

                //判断数据类型
                if (value && !regExp.test(value)) {
                    //失败
                    return 0;
                }

                // 规则校验
                var result = rules.split('-');

                for (var len = result.length, i = len - 1; i > -1; i--) {
                    //重置
                    flag = 1;
                    var item = result[i],
                        res = '';

                    // 取正则: 必填、非必填
                    res = objRules[item];
                    if (res) {
                        var reg = new RegExp(res, 'gim');
                        if (!reg.test(value)) {
                            // 不显示错误信息
                            return -1;

                        }
                    }

                    // 最小长度判断 
                    if (!!~item.indexOf('minlength')) {
                        res = item.match(/^minlength_(\d+)$/i);
                        var minLen = res && (res[1] - 0);
                        if (strLen < minLen) {
                            return -1;
                        }
                    }

                    // 固定长度判断
                    if (!!~item.indexOf('lengths')) {
                        res = item.match(/^lengths_(\d+)$/i);
                        var fixLen = res && (res[1] - 0);

                        if (strLen !== fixLen) {
                            return 0;
                        }
                    }

                    //max
                    if (type === 'number' && !!~item.indexOf('max_')) {
                        res = item.match(/^max_(\d+)$/i);
                        var maxVal = res && (res[1] - 0);

                        if (value - 0 > maxVal - 0) {
                            return 0;
                        }
                    }

                    //min
                    if (type === 'number' && !!~item.indexOf('min_')) {
                        res = item.match(/^min_(\d+)$/i);
                        var minVal = res && (res[1] - 0);

                        if (value - 0 < minVal - 0) {
                            return 0;
                        }
                    }
                }
                return flag;
            },

            /**
             * 检查所有input状态
             */
            validateState: function() {
                var domList = $(objParam.formId).find(objParam.className);

                for (var len = domList.length - 1; len > -1; len--) {
                    if ($(domList[len]).data('valid-state') !== 1) {
                        return false;
                    }
                }
                return true;
            },

            //submit验证
            validateForm: function() {
                var  validateDom =$(objParam.formId).find(objParam.className);
                for(var i = validateDom.length - 1; i > -1; i--) {
                    var $dom =  $(validateDom[i]);
                    var rules = $($dom).data('valid-rules');
                    // 最大长度处理
                    var regRes = rules.match(/maxlength_(\d+)$/i);
                    regRes && regRes[1] && $($dom).attr('maxlength', regRes[1]);

                    // 固定长度处理
                    var lenRes = rules.match(/lengths_(\d+)$/i);
                    lenRes && lenRes[1] && $($dom).attr('maxlength', lenRes[1]);
                }


                $(objParam.formId).on('click', objParam.btnClass, function() {
                    $(objParam.formId).find(objParam.errorClass).hide();

                    var domList = $(objParam.formId).find(objParam.className);
                    var flag = true;

                    for (var len = domList.length - 1; len > -1; len--) {

                        var $currentId = $(domList[len]);

                        var type = $($currentId).data('valid-type'),
                            rules = $($currentId).data('valid-rules'),
                            pattern = $($currentId).data('valid-pattern'),
                            value = $.trim($($currentId).val());

                        type = type ? type.toLowerCase() : '';
                        rules = rules ? rules.toLowerCase() : '';

                        if (!type && !rules && $($currentId).data('valid-state') === 1) {
                            continue;
                        }

                        var param = {
                            'pattern': pattern,
                            'type': type,
                            'rules': rules,
                            'value': value
                        };

                        var inputState = $.validate.validateInput(param);

                        if (flag && inputState !== 1) {
                            flag = false;
                        }

                        $($currentId).data('valid-state', inputState);

                        if (inputState !== 1) {
                            //错误信息
                            if (objParam.errorMode) {
                                var $errorId = $($currentId).parent().find(objParam.errorClass);
                                //错误信息
                                if (!$.trim($($errorId).html())) {
                                    $($errorId).html($($currentId).data('valid-msg')).show();
                                } else {
                                    $($errorId).show();
                                }
                            } else {
                                //悬浮 TODO
                            }
                        }
                    }
                    objParam.fnCB(objParam.extValidate() && flag);
                });
                $.validate.validateCheckEvent(objParam.fnCB);
            }
        };
    })();

    /**
     * 工具类
     */
    $.util = (function() {
        return {
            /**
             * 类型判断
             */
            type: function(arg) {
                var str = Object.prototype.toString.call(arg);
                var res = str.match(/object\s(\w+)/);
                return res && res[1] || '';
            }
        };
    })();

})(Zepto);