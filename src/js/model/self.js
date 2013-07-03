define([
  'model/user',
  'model/service'
], function (User, service) {

  var _user = new User({isAuth: false});

  function _authCallback(data) {
    console.log(data);

    var data = JSON.parse(data).response.user;

    data.isAuth = true;

    _user.set(data);
  }

  function _auth() {
    $.get(
      "https://api.foursquare.com/v2/users/self?oauth_token=" + service.foursquare.get('access_token'),
      function(data){
        _authCallback(data);
      }
    )
  }

  service.foursquare.on('change:access_token', _auth);

  return _user;
});