$(function() {
  var param =  {
    'validateType': 'realTime'
  };
  $('#validateForm').validateAll({
    fn: function(arg) {
      console.log(arg)
    },
    extValidate: function() {
      if ( $("input[type='checkbox']:checked").length > 2 ){
        return true;
      } else {
        $('#demo').html('www').show();
        return false;
      }
    }
  });
})


