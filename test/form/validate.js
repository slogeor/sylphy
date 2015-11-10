/**
 * @description form表单校验
 * @author slogeor
 * @date 2015-11-09
 */

(function($) {
    /**
     * 表单校验默认配置
     */
    var objParam = {
        /**
         * 表单提交验证
         * @map {
         *  true: 开启
         *  false: 禁用
         * }
         */
        validateForm: true,

        /**
         * 禁用submit按钮
         * @map {
         *  true: 开启
         *  false: 禁用
         * }
         */
        submitEnabled: true,

        /**
         * 表单验证方式
         * @map {
         *  ture: 即实验证
         *  false: 提交验证
         * }
         */
        validateMode: false,


        // input绑定的class
        className: '.validate',

        //btn class
        btnClass: '.valid-submit',

        //error class        
        errorClass: '.valid-error',
        /**
         * 错误提示方式
         * @map {
         *  true: '下方'
         *  false: 悬浮
         * }
         */
        errorMode: true,

        // 额外的其他验证
        extValidate: function() {
            return true;
        },

        //form表单id
        formId: undefined
    };

    /**
     * 默认正则校验
     * email: 邮箱
     * number: 数字
     * ulr: url地址
     * tel: 电话号码
     * zipcode: code
     */
    var objReg = {
        'email': '^[a-z0-9._%-]+@([a-z0-9-]+\\.)+[a-z]{2,4}$',
        'number': '^\\-?\\d+(\\.\\d+)?$',
        'url': '^(http|https|ftp)\\:\\/\\/[a-z0-9\\-\\.]+\\.[a-z]{2,3}(:[a-z0-9]*)?\\/?([a-z0-9\\-\\._\\?\\,\\\'\\/\\\\\\+&amp;%\\$#\\=~])*$',
        'tel': '^1\\d{10}$',
        'zipcode': '^\\d{6}$',
        'string': '\\w+',
        'radio': '',
        'checkbox': '',
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
        objParam = $.extend({}, objParam, param.objParam || {});
        objReg = $.extend({}, objReg, param.objReg || {});
        return $(this);
    };

    /**
     * 表单submit校验
     * @param {Function} fn          callback
     * @param {Function} extValidate 额外验证
     */

    $.fn.validateAll = function(factory) {
        var type = $.util.type(factory).toLowerCase(),
            fn = '';

        /**
         * 参数类型判断
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        if (type === 'object') {
            //对象
            fn = factory.fn;
            objParam.extValidate = factory.extValidate;
        } else if (type === 'function') {
            fn = factory;
        }

        //更新formId
        objParam.formId = '#' + $(this).closest('form').attr('id');

        if (objParam.validateMode) {
            //即时验证
            $.validate.validateInputEvent(fn);
        } else {
            // 提交验证
            $.validate.validateForm(fn);
        }

        // return $(this);
    };

    /**
     * 校验规则
     */
    $.validate = (function() {
        return {

            /**
             * 事件验证
             */
            validateInputEvent: function(fn) {
                // input事件
                $(objParam.formId).on('input', objParam.className, function() {
                    /**
                     * type: input类型
                     * rules: 校验规则
                     * pattern: 正则规则
                     * value: input值
                     * id: id选择器
                     * typeList: 类型数组
                     */
                    var type = $(this).data('valid-type'),
                        rules = $(this).data('valid-rules'),
                        pattern = $(this).data('valid-pattern'),
                        value = $.trim($(this).val()),
                        id = $(this).attr('id'),
                        typeList = ['number', 'tel'];

                    type = type ? type.toLowerCase() : '';
                    rules = rules ? rules.toLowerCase() : '';

                    // 替换type，实现手机输入法状态切换
                    !!~$.inArray(type, typeList) && $(this).attr('type', 'tel');

                    // 最大长度处理
                    var regRes = rules.match(/maxlength_(\d+)$/i);
                    regRes && regRes[1] && $(this).attr('maxlength', regRes[1]);

                    // 固定长度处理
                    var lenRes = rules.match(/lengths_(\d+)$/i);
                    lenRes && lenRes[1] && $(this).attr('maxlength', lenRes[1]);

                    //错误信息
                    $(this).parent().find(objParam.errorClass).hide();

                    /**
                     * 规则校验
                     * 1: 通过
                     * 0: 未通过，显示错误
                     * -1: 未通过，不显示错误
                     */
                    var param = {
                        'pattern': pattern,
                        'type': type,
                        'rules': rules,
                        'value': value
                    };

                    var inputState = $.validate.validateInput(param);
                    $(this).data('valid-state', inputState);

                    var formState = false;

                    var $selectId = $(objParam.formId).find(objParam.btnClass);

                    console.log(inputState);
                    if (inputState === 0) {
                        //禁用
                        if (objParam.submitEnabled) {
                            $($selectId).attr('disabled', true);
                        }

                        //错误信息
                        if (objParam.errorMode) {
                            var $errorId = $(this).parent().find(objParam.errorClass);
                            //错误信息
                            if (!$.trim($($errorId).html())) {
                                $($errorId).html($(this).data('valid-msg')).show();
                            } else {
                                $($errorId).show();
                            }
                        } else {
                            //悬浮 TODO
                        }
                    } else if (inputState === 1) {
                        //全局校验
                        formState = $.validate.validateState();

                        if (formState) {
                            // 还原submit
                            if (objParam.submitEnabled) {
                                $($selectId).removeAttr('disabled');
                            }
                        } else {
                            // 恢复disabled
                            if (objParam.submitEnabled) {
                                $($selectId).attr('disabled', true);
                            }
                        }
                    }
                    return fn(objParam.extValidate() && formState);
                });

                //blur事件
                $(objParam.formId).on('blur', objParam.className, function() {
                    if ($(this).data('valid-state') === -1) {
                        if (objParam.errorMode) {
                            var $errorId = $(this).parent().find(objParam.errorClass);
                            //错误信息
                            if (!$.trim($($errorId).html())) {
                                $($errorId).html($(this).data('valid-msg')).show();
                            } else {
                                $($errorId).show();
                            }
                        } else {
                            //悬浮 TODO
                        }
                    }
                });
                $.validate.validateCheckEvent();
            },

            //radio、checkbox
            validateCheckEvent: function() {
                //单选、多选
                $(objParam.formId).on('click', 'input', function() {
                    var type = $(this).attr('type');
                    var $id = $(this).parent().find(objParam.className);
                    if (type === 'radio') {
                        // 单选
                        $id.data('valid-state', 1);
                    } else if (type === 'checkbox') {
                        //多选
                        var len = $("input[type='checkbox']:checked").length;

                        // 默认是必选的
                        var rule = $id.data('valid-rules');

                        if (rule === 'norequired') {
                            $id.data('valid-state', 1);
                        } else {
                            $id.data('valid-state', len > 0 ? 1 : 0);
                        }
                    }

                    if (objParam.validateMode) {
                        // 即时校验
                        //全局校验
                        var formState = $.validate.validateState();

                        var $selectId = $(objParam.formId).find(objParam.btnClass);
                        if (formState) {
                            // 还原submit
                            if (objParam.submitEnabled) {
                                $($selectId).removeAttr('disabled');
                            }
                        } else {
                            if (objParam.submitEnabled) {
                                $($selectId).attr('disabled', true);
                            }
                        }
                    }
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

                if (!value) {
                    return -1;
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
                            flag = -1;
                        }
                    }

                    // 最小长度判断 
                    if (!!~item.indexOf('minlength')) {
                        res = item.match(/^minlength_(\d+)$/i);
                        var minLen = res && (res[1] - 0);
                        if (strLen < minLen) {
                            flag = -1;
                        }
                    }

                    // 固定长度判断
                    if (!!~item.indexOf('lengths')) {
                        res = item.match(/^lengths_(\d+)$/i);
                        var fixLen = res && (res[1] - 0);

                        if (strLen !== fixLen) {
                            flag = 0;
                        }
                    }

                    //max
                    if (type === 'number' && !!~item.indexOf('max_')) {
                        res = item.match(/^max_(\d+)$/i);
                        var maxVal = res && (res[1] - 0);

                        if (value - 0 > maxVal - 0) {
                            flag = 0;
                        }
                    }

                    //min
                    if (type === 'number' && !!~item.indexOf('min_')) {
                        res = item.match(/^min_(\d+)$/i);
                        var minVal = res && (res[1] - 0);

                        if (value - 0 < minVal - 0) {
                            flag = 0;
                        }
                    }

                    if (flag !== 1) {
                        return flag;
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
            validateForm: function(fn) {
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

                        if(!type && !rules && $($currentId).data('valid-state') === 1) {
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
                    fn(objParam.extValidate() && flag);
                });
                $.validate.validateCheckEvent();
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