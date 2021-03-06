//事件注册
var EventUtil = {
  addHandler: function(element, type, handler) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + type, handler);
    } else {
      element["on" + type] = handler;
    }
  }
};

function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
  var dataURL = canvas.toDataURL("image/" + ext);
  return dataURL;
}

var btn = document.getElementById("btn");
var pic = document.getElementById("img");

var ua = navigator.userAgent.toLowerCase();
EventUtil.addHandler(btn, 'click', function() {
  var file = document.getElementById("logo");

  var ext = file.value.substring(file.value.lastIndexOf(".") + 1).toLowerCase();

  // gif在IE浏览器暂时无法显示
  if (ext != 'png' && ext != 'jpg' && ext != 'jpeg') {
    alert("图片的格式必须为png或者jpg或者jpeg格式！");
    return;
  }
  if (/msie ([^;]+)/.test(ua)) {
    var lowIE10 = RegExp["$1"] * 1;
    if (lowIE10 == 6) {
      // IE6浏览器设置img的src为本地路径可以直接显示图片
      file.select();
      // 在file控件下获取焦点情况下 document.selection.createRange() 将会拒绝访问，所以我们要失去下焦点。
      file.blur();

      var reallocalpath = document.selection.createRange().text;
      pic.src = reallocalpath;
    } else if (lowIE10 < 10) {
      // IE7~9 IE10+按照html5的标准去处理
      file.select();
      // 在file控件下获取焦点情况下 document.selection.createRange() 将会拒绝访问，所以我们要失去下焦点。
      file.blur();

      var reallocalpath = document.selection.createRange().text;
      // 非IE6版本的IE由于安全问题直接设置img的src无法显示本地图片，但是可以通过滤镜来实现
      pic.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src=\"" + reallocalpath + "\")";
      // 设置img的src为base64编码的透明图片 取消显示浏览器默认图片
      pic.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    } else if (lowIE10 >= 10) {
      html5Reader(file);
    }
  } else {
    html5Reader(file);
  }
});

function html5Reader(file) {
  var fileObj = file.files[0],
    img = document.getElementById("img");

  // URL.createObjectURL  safari不支持
  img.src = URL.createObjectURL(fileObj);
  img.onload = function() {
    console.log(img)
    var data = getBase64Image(img);
    console.log(data); // 打印出base64编码
  }
}