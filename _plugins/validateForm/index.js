$(function() {
  $('#validateForm').validateAll(function(arg) {
    if (arg) {
      alert('通过');
    }
  });

  $('#validateForm1').resetParam({
    'validateMode': false
  }).validateAll(function(arg) {
    alert(arg);
  });
})