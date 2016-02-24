//音乐播放
$('.J-audio').on('click', function() {
  //暂定
  var $audio = $('.audio-source');
  $audio.each(function() {
    $(this)[0].pause();
    $('.J-audio').find('.J-antimate').removeClass('play').removeClass('play-end');
  });

  //play
  var $currAudio = window.document.getElementById('J-audio-' + $(this).data('num'));
  $currAudio.load();
  $currAudio.play();

  // 添加
  $(this).find('.J-antimate').addClass('play');

  // 添加音符
  $('.J-voice').each(function(key, value) {
    var className = "voice-animation" + (key + 1);
    $(value).addClass(className);
  })
});

//监听end
$('.audio-source').each(function() {
  $(this).on('ended', function() {
    setTimeout(function() {
      $('.J-audio').find('.J-antimate').addClass('play-end').removeClass('play');
      $('.J-voice').each(function(key, value) {
        var className = "voice-animation" + (key + 1);
        $(value).removeClass(className);
      })
    }, 500);
  });
});

// 水波处理
setTimeout(function() {
  $('.ripple-animation2').addClass('ripple-inner');
}, 1500);
setTimeout(function() {
  $('.ripple-animation3').addClass('ripple-inner');
}, 2900);