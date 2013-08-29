define([
  'text!template/searchVenue.html',
  'text!template/searchVenueItem.html',
  'model/service',
  'model/venue',
  'model/position',
  'view/venue',
  'view/drawer'
], function(template, itemTemplate, Service, VenueModel, Position, VenueView, Drawer) {
  'use strict';

  var _drawer,
    _search,
    _model;

  /**
    Method opens venue after user click.

    @method _itemClick
    @for SearchVenue
    @static
    @private
  */
  function _itemClick(element) {
    element.preventDefault();

    return new VenueView(
      new VenueModel(
        {id: element.currentTarget.id}
      ),
      _drawer
    );
  }

  /**
    Method updates current user rearch results. If we don't have GPS position we check for last checkin and external service.
    If checkin and service have different countries we always trust external service. We assume that no one uses proxy on cellphone.

    @method _updateSearch
    @for SearchVenue
    @static
    @private
  */
  function _updateSearch(type) {

    var input = $('input'),
      gps = _model.get('gps'),
      checkin = _model.get('checkin'),
      service = _model.get('service');

    function _callback(data) {
      $('ul.venues').empty();
      var _data;
      if (typeof data === 'string') {
        _data = JSON.parse(data);
      } else {
        _data = data;
      }
      $(_data.response.groups[0].items).each(function() {
        if (type === 'search') {
          $('ul.venues').append(_.template(itemTemplate, this));
        } else {
          $('ul.venues').append(_.template(itemTemplate, this.venue));
        }
      });
      $('ul.venues > li').on('click', _itemClick);
    }

    function _showProgress() {
      $('ul.venues > li').off('click', _itemClick);
      $('ul.venues').html('<progress class="centre top"></progress>');
    }

    function _getSearch(position) {
      if (_search !== undefined) {
        _search.abort();
      }
      _search = $.get(
        'https://api.foursquare.com/v2/venues/' + type
          + '?ll=' + position.latitude + ',' + position.longitude
          + '&oauth_token=' + Service.foursquare.get('access_token')
          + '&query=' + $('input').val(),
        _callback
      );
    }

    //Check if we have any position.
    if (((gps !== null && gps !== false) ||
        checkin !== null ||
        service !== null) &&
        input.val() !== '') {
      _showProgress();
      //If we have a gps position.
      if (gps !== null && gps !== false) {
        _getSearch(gps);
      } else if (checkin !== null &&
          service !== null) {
        //If we have both checkin and service. Service country should be right.
        if (checkin.country !== service.country_name) {
          _getSearch(service);
        } else {
          _getSearch(checkin);
        }
      } else if (checkin !== null) {
        _getSearch(checkin);
      } else {
        _getSearch(service);
      }
    }
  }

  /**
    Method is called when GPS status changes and icon is refreshed.

    @method _updateGPSStatus
    @for SearchVenue
    @param {Object} event object.
    @static
    @private
  */
  function _updateGPSStatus() {
    var status = _model.get('gps');

    if (status !== null &&
        status !== false) {
      $('body > section > header > menu > a .icon').removeClass('waiting');
    }
  }

  /**
    Method removes SearchVenue from DOM and unbinds events.

    @method _remove
    @for SearchVenue
    @static
    @private
  */
  function _remove() {
    $('input').off('keyup', _updateSearch);
    $('ul.venues > li').off('click', _itemClick);
    _model.off('change', _updateSearch);
    _model.off('change:gps', _updateGPSStatus);
    _model.destroy();
    $('body > section > header > menu').remove();
  }

  /**
    Method is called when user request GPS status information.

    @method _showGPSStatus
    @for SearchVenue
    @param {Object} event object.
    @static
    @private
  */
  function _showGPSStatus(event) {
    if (event !== undefined) {
      event.preventDefault();
    }

    var position = _model.get('gps');

    if (position === null) {
      _drawer.showStatus('Still waiting for <strong>GPS</strong> signal. You can try to search anyway.');
    } else if (position === false) {
      _drawer.showStatus('<strong>GPS</strong> device is unavailable');
    } else {
      _drawer.showStatus('Now we have your <strong>GPS</strong> position!');
    }
  }

  /**
    Method is called when SearchVenue object is initialized.

    @method _initialize
    @for SearchVenue
    @param {Object} drawer object.
    @static
    @private
  */
  function _initialize(type) {

    _drawer = new Drawer(_remove);

    if (type === undefined) {
      type = 'search';
    }

    _drawer.setTitle(type.charAt(0).toUpperCase() + type.slice(1) + ' venue');

    $('section header a').last().on('click', _drawer.removeWindow);
    $('section div[role="main"]').last().html(_.template(template));
    $('input').on('keyup', function() {_updateSearch(type); });
    _model = new Position();
    _model.initializee();
    _model.on('change', function() {_updateSearch(type); });
    _model.on('change:gps', _updateGPSStatus);

    $('body > section > header').prepend('<menu type="toolbar"><a href="#search"><span class="icon icon-gps-status waiting">GPS</span></a></menu>');
    $('body > section > header > menu > a .icon').on('click', _showGPSStatus);
  }

  /**
    SearchVenue view that is extension of [Backbone.View](http://backbonejs.org/#View).

    @class SearchVenue
    @namespace View
    @extends Backbone.View
  */
  return Backbone.View.extend({
    /**
      Method is called when new SearchVenue object is created. It points to {{#crossLink "SearchVenue/_initialize"}}{{/crossLink}} method.

      @method initialize
      @for SearchVenue
      @constructor
    */
    initialize: function() {
      _initialize(this.options.type);
    },
    /**
      Method points to {{#crossLink "SearchVenue/_remove"}}{{/crossLink}} method.

      @method remove
      @for SearchVenue
    */
    remove: _remove
  });
});
