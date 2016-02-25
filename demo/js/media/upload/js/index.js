'use strict';
$(function() {
  //====================html5====================
  // 事件管理
  function evtManager() {
    // 上传代理
    $('#upload-proxy').on('click', function() {
      $('#upload-file').trigger('click');
    });

    // 触发文件上传
    $('#upload-file').on('change', function() {
      uploadFile();
    });
  }

  // 文件上传
  function uploadFile() {
    var file = $('#upload-file')[0];
    var fileName = file.value;

    //文件后缀      
    var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

    //图片类型
    var imgList = ['png', 'jpg', 'jpeg'];
    if (imgList.indexOf(fileExt) === -1) {
      alert('Please upload a .JPG/.PNG file');
      return;
    }
    if (typeof FileReader !== 'undefined') {

      var reader = new FileReader();
      // 将文件以Data URL形式进行读入页面
      reader.readAsDataURL(file.files[0]);

      //数据读取开始时触发
      reader.onloadstart = function(evt) {
        console.log('onloadstart', evt);
      };

      //数据读取中
      reader.onprogress = function(evt) {
        console.log('onprogress', evt);
      };

      //数据读取出错时触发
      reader.onerror = function(evt) {
        console.log('onerror', evt);
      };

      reader.onload = function(evt) {
        console.log('onload', evt);
        // 显示
        $('#show-page').show();
        $('#show-img').attr('src', this.result);
      };
    } else {　
      // iframe 上传
      document.domain = 'mi.com';
      // 设置action
      $('#submit-file')[0].action = 'http://upload.global.mi.com/upload/multiimgs?uploadsuccess=uploadSuccess&uploaderror=uploadError';
      //提交
      $('#submit-file').submit();　
    }
  }

  // 上传成功
  window.uploadSuccess = function() {
    console.log('success');
  };

  // 上传失败
  window.uploadError = function() {
    console.log('error');
  };


  // 初始化
  (function init() {
    evtManager();
  }());
});