define([
  'model/currentUser'
], function (CurrentUser) {
  'use strict';

  /**
    Method actualize current user position using GPS.

    @method _getGPS
    @for Position
    @static
    @private
  */
  function _getGPS() {

    var that = this;

    //Should be called wit `this` set to model
    if (this === window) {
      return;
    }

    function _clear() {
      //We don't need to watch position all the time after we fetch one.
      window.navigator.geolocation.clearWatch(this.positionWatch);
    }

    function _success(position) {
      this.set('gps', position.coords);
      _clear.call(this);
    }

    function _error() {
      this.set('gps', false);
      _clear.call(this);
    }

    if (window.navigator.geolocation !== undefined) {
      this.positionWatch = window.navigator.geolocation.watchPosition(
        function(position) {
          _success.call(that, position);
        },
        function() {
          _error.call(that);
        }
      );
    }

    return _clear;
  }

  /**
    Method fetch current user position from last checkin.

    @method _getCheckin
    @for Position
    @static
    @private
  */
  function _getCheckin() {

    var that = this;

    //Should be called wit `this` set to model
    if (this === window) {
      return;
    }

    function _callback() {
      var venue,
        checkin;

      if (CurrentUser.get('checkins').items.length > 0) {
        venue = CurrentUser.get('checkins').items[0].venue;
        checkin = venue.location;
        checkin.latitude = venue.location.lat;
        checkin.longitude = venue.location.lng;
        this.set('checkin', checkin);
        //_updateSearch();
      }
    }

    //If we fail to reset model state, use last avaliable checkin.
    CurrentUser.fetch({
      success: function() {
        _callback.call(that);
      },
      error: function() {
        _callback.call(that);
      }
    });
  }

  /**
    Method fetch current user position from freegeoip.net service.

    @method _getService
    @for Position
    @static
    @private
  */
  function _getService() {

    var that = this;

    //Should be called wit `this` set to model
    if (this === window) {
      return;
    }

    function _callback(data) {
      var dataJson;

      if (typeof data === 'string') {
        dataJson = JSON.parse(data);
      } else {
        dataJson = data;
      }

      this.set('service', dataJson);
      //_updateSearch();
    }

    $.get(
      'http://freegeoip.net/json/',
      function(data) {
        _callback.call(that, data);
      }
    );
  }

  /**
    Gps model that is extension of [Backbone.Model](http://backbonejs.org/#Model).

    @class Position
    @namespace Model
    @extends Backbone.Model
  */
  return Backbone.Model.extend({

    positionWatch: null,

    initializee: function() {
      this.destroy = _getGPS.call(this);
      _getCheckin.call(this);
      _getService.call(this);
    },

    defaults: {
      gps: null,
      checkin: null,
      service: null
    }
  });
});
