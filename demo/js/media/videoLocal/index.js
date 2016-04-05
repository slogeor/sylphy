function init() {
  //播放视频
  $('#J_main').on('click', '.J_videoItem', function() {
    var $this = $(this),
      index = $this.data('index'), //视频索引
      flag = $this.data('flag'), //播放标志
      $prePlayImg = $('#J_prePlayImg'), //视频图片
      $videoPlay = $('.J_video'); //视频

    if (flag === 'pause') {
      //开始
      $prePlayImg.addClass('hide');
      $videoPlay.addClass('hide');

      //暂停所有
      for (var i = 0; i < 3; i++) {
        $videoPlay.get(i) && $videoPlay.get(i).pause();
      }

      //设置pause 状态
      $('.J_videoItem').data('flag', 'pause');

      //重置动画
      $('.J_videoItem').find('.border-circle').removeClass('video-play').addClass('video-play-paused');

      //设置src
      var $playId = $('#J_play' + index);
      if (!$playId.find('source').attr('src')) {
        $playId.find('source').attr('src', $playId.find('source').data('src'));
      }

      //加载视频
      $playId.removeClass('hide');
      $playId.get(0).load();

      //设置标志
      $this.data('flag', 'play');

      //添加动画
      $this.find('.border-circle').addClass('video-play').removeClass('video-play-paused');

      //半透明效果
      $('#J_videoList').addClass('played');

    } else if (flag === 'play') {
      //暂停播放
      $('#J_play' + index).get(0).pause();

      //设置状态
      $this.data('flag', 'pause');

      //暂停动画
      $this.find('.border-circle').addClass('video-play-paused');

      //透明效果
      $('#J_videoList').removeClass('played');
    } else if (flag === 'ended') {
      //结束
      $('#J_play' + index).get(0).play();

      //设置状态
      $this.data('flag', 'play');

      //动画
      $this.find('.border-circle').removeClass('video-play').addClass('video-play-paused');

      //半透明效果
      $('#J_videoList').addClass('played');
    }
  })

  //播放完
  $(".J_video").each(function() {
    $(this).on('ended', function(evt) {
      var index = $(this).data('index');
      // $('#J_play' + index).get(0).load();
      $('#J_videoItem' + index).data('flag', 'ended');
      //重置动画
      $('#J_videoItem' + index).find('.border-circle').removeClass('video-play').addClass('video-play-paused');
    })

    //加载完播放
    $(this).on('loadeddata', function() {
      var index = $(this).data('index');
      $('#J_play' + index).get(0).play();
    })
  })
};

init();