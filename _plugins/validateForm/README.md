##form表单校验

###功能描述
1、校验方式

支持即时校验、提交校验两种方式，默认为即时校验

2、表单类型

目前只支持email、number、tel、url、zipcode、pattern、string

3、校验规则

目前支持require、norequire、minlength、maxlength、lengths、min、max，其中max和min只对number有效

4、可扩展校验规则
重写extValidate方法即可

5、radio、checkbox校验

默认只校验选中，可通过重写extValidate进行定制化

6、错误提示

支持浮层和固定位置，默认是固定位置，浮层暂无实现

###参数说明

```js 
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
```

### 提供的api
  
1、resetParam(obj) 

  *输入: obj
  *输出: $(this)
  *调用: $(this).resetParam(obj)
  *obj: 参考上面的参数配置
  *功能: 重置系统默认的参数

2、resetReg(obj) 

  *输入: obj
  *输出: $(this)
  *调用: $(this).resetReg(obj)
  *功能: 重置系统默认的正则判断

3、validateAll(factory)  

  *输入: factory
  *输出: Boolean
  *调用: $(this).validateAll(obj)
  *功能: 表单校验

###需要说明的哪些事

input元素需绑定的

```js
class="validate" --->input 绑定事件用

data-valid-pattern="/^\d+$/" --->设置正则

data-valid-type="email" ---> 设置input的类型

data-valid-state="0" --->验证通过标志位

data-valid-rules='max_5' --->设置校验规则

data-valid-msg="pattern is error" --->错误提示文案

class="valid-error"  --->错误的class明

class="valid-submit" --->button按钮
```
  
### 使用说明  
1、引入validate.js

2、在html设置校验规则

3、js里调用

```js
//及时校验
$('#formId').validateAll(function(arg) {
  if(arg) {
    1、ajax
    //TODO
    2、form
    $('#formId').on('click', 'button', function(evt) {
        //TODO
      })
  }
});

//提交校验
$('#validateForm').validateAll(function(arg) {
  if(arg) {
      1、ajax        
      //todo
      
      2、form
      // $('#validateForm').submit();
    }
 });
 
//扩充校验
$('#validateForm').validateAll(function(arg) {
  //TODO
}, {
  'extValidate': function() {
    //TODO
    return Boolean
  }
});
```

###TODO
1、错误信息浮层



