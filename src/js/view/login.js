define([
  'text!template/login.html',
  'text!root/config.json',
  'model/service'
], function (template, config, service) {
  'use strict';
  var _window,
    _initialize,
    _message,
    _exit,
    _remove,
    _loginButton = null,
    _exitButton = null;

  /**
    Method is called when user clicks on `Login` button. Foursquare oauth window is open.

    @method _login
    @for Login
    @param {Object} event
    @static
    @private
  */
  function _login(event) {
    event.preventDefault();

    var conf = JSON.parse(config),
      url = 'https://foursquare.com/oauth2/authenticate?'
          + 'client_id='
          + conf.services.foursquare.client_id
          + '&response_type=token'
          + '&redirect_uri='
          + conf.services.foursquare.api_endpoint
          + window.location.protocol + '/' + window.location.host;

    _window = window.open(url);
  }

  /**
    Method is called after response from oauth endpoint is recived.

    @method _message
    @for Login
    @param {Object} event `window` on `message` event.
    @static
    @private
  */
  _message = function (event) {
    var access_token = event.data.access_token;

    if (access_token !== undefined) {
      service.foursquare.set('access_token', access_token);
      window.location.hash = '#logging';
    }

    _window.close();
  };

  /**
    Method is called when Login object is initialized.

    @method _initialize
    @for Login
    @static
    @private
  */
  _initialize = function () {
    document.body.innerHTML = _.template(template, {});
    _loginButton = document.getElementById('login-button');
    _exitButton = document.getElementById('exit-button');
    window.addEventListener('message', _message);
    _loginButton.addEventListener('click', _login);
    _exitButton.addEventListener('click', _exit);
  };

  /**
    Method removes Login from DOM and unbinds events.

    @method _remove
    @for Login
    @static
    @private
  */
  _remove = function () {
    _loginButton.removeEventListener('click', _login);
    _exitButton.removeEventListener('click', _exit);
    window.removeEventListener('message', _message);
    _loginButton = null;
    _exitButton = null;
  };

  /**
    Method is called when user clicks on `exit` button.

    @method _exit
    @for Login
    @static
    @private
  */
  _exit = function () {
    _remove();
    window.close();
  };

  /**
    Login view that is extension of [Backbone.View](http://backbonejs.org/#View).

    @class Login
    @namespace View
    @extends Backbone.View
  */
  return Backbone.View.extend({
     /**
      Method is called when new Drawer object is created. It points to {{#crossLink "Login/_initialize"}}{{/crossLink}} method.

      @method initialize
      @for Login
      @constructor
    */
    initialize: _initialize
  });
});
