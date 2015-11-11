$(function() {
  $('#validateForm').resetParam({
    'validateMode': true
  }).validateAll(function(arg) {
  // $('#validateForm').validateAll(function(arg) {
    if(arg) {
      // 及时
      // $('#validateForm').on('click', 'button', function(evt) {
      //   evt.preventDefault();
        console.log('todo');
      // })

      // 提交验证
      //todo
      // $('#validateForm').submit();
    }
  });
})


