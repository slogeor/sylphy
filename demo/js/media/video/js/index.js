$(function() {
  $('#submit').on('click', function() {
    var video = $.trim($('#video-url').val());
    var result = parseVideo(video);
    console.log(result)
    if (result.video) {
      $('#video-iframe').attr('src', result.video);
      $('#video-iframe-page').show();
    }
    result.videothumb && $('#video-img').attr('src', result.videothumb);
  })
});


//视频转换
function parseVideo(video) {
  var result = {};

  // youtube
  var ytRegx = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
  var ytEmbed = 'https://www.youtube.com/embed/';
  var ytThumb = 'http://img.youtube.com/vi/$1/0.jpg';

  // youtube
  if (ytRegx.test(video)) {
    var code = video.match(ytRegx);
    code = code[1];
    result.video = ytEmbed + code;
    if (code) {
      result.videothumb = code.replace(new RegExp('(' + code + ')'), ytThumb);
    }
  } else if (video.indexOf('youku') !== -1) {
    // youku
    if (video.indexOf('embed') !== -1) {
      result.video = video;
    } else {
      var pos = video.indexOf('.html'),
        ykEmbed = 'http://player.youku.com/embed/',
        ykRegx = undefined,
        code = undefined;
      if (pos === -1) {
        ykRegx = /id\_(.+)/i
      } else {
        ykRegx = /id\_(.+)(\.html){0,1}/i;
      }
      code = video.match(ykRegx);
      result.video = ykEmbed + code[1];
    }
  }
  return result;
}