$(function() {
  var param =  {
    'validateType': 'realTime'
  };
  $('#validateForm').validateAll(function() {
    console.log(arguments);
  },param);
})


