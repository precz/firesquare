define([
  'text!template/recent.html',
  'text!template/checkin.html',
  'text!template/progress.html',
  'view/drawer',
  'view/venue',
  'view/searchVenue',
  'collection/recent',
  'model/venue'
], function (template, checkinTemplate, progressTemplate, Drawer, Venue, SearchVenue, Recent, VenueModel) {
  'use strict';
  var _drawer,
    _recent,
    _fetch,
    _remove,
    _add,
    _update,
    _recentCheckinElement = null;

  function _searchVenue(event) {
    event.preventDefault();
    return new SearchVenue(_drawer);
  }

  /**
    Method shows the main view. After the spinner.

    @method _initialize
    @namespace View
    @for Recent
    @param {Backbone.Collection} collection of recent checkins.
    @static
    @private
  */
  function _show(collection) {
    _drawer.setContent(_.template(template, {}));
    _recentCheckinElement = document.getElementById('recent-checkins-list');
    collection.each(function(checkin) {
      _add(checkin);
    });
    $('body > section > header').prepend('<menu type="toolbar"><a href="#"><span class="icon icon-update">add</span></a></menu>');
    $('body > section > header > menu > a .icon-update').on('click', _update);
    _recent.on('add', _add);
  }

  /**
    Method is called when Login object is initialised.

    @method _initialize
    @namespace View
    @for Recent
    @static
    @private
  */
  function _initialize() {
    _drawer = new Drawer(_remove, _update);
    _drawer.setTitle('Recent checkins');
    _drawer.setContent(_.template(progressTemplate));

    _recent = new Recent();
    _fetch = _recent.fetch({
      success: _show
    });
  }

  /**
    Method is called when user click's on update button.

    @method _update
    @for Recent
    @param {Object} event
    @static
    @private
  */
  _update = function (event) {
    if (event !== undefined) {
      event.preventDefault();
    }

    function _success() {
      $('p[role="status"]').hide('fast');
    }

    function _error() {
      var _text = $('p[role="status"] > span').text();
      $('p[role="status"] > span').text('Update failed!');
      $('p[role="status"]').hide('slow', function () {
        $('p[role="status"] > span').text(_text);
      });
    }

    $('div[role="main"]').scrollTop(0);
    $('p[role="status"]').show('fast', function () {
      if (_fetch !== undefined &&
          typeof (_fetch.abort) === 'function') {
        _fetch.abort();
      }
      _fetch = _recent.fetch({
        remove: false,
        success: _success,
        error: _error
      });
    });
  };

  /**
    Method is called when user click's on venue.

    @method _showVenue
    @for Recent
    @param {Object} event
    @static
    @private
  */
  function _showVenue(element) {
    element.preventDefault();

    return new Venue(
      new VenueModel(
        _recent.get(element.currentTarget.id).get('venue')
      ),
      _drawer
    );
  }

  /**
    Method is called when new object is added to checkin's collection.

    @method _add
    @for Recent
    @param {Object} checkin
    @static
    @private
  */
  _add = function (checkin) {
    var i,
      length = _recentCheckinElement.childNodes.length,
      current = null,
      addedElement = null;

    for (i = 0; i < length; i += 1) {
      current = _recentCheckinElement.childNodes[i]; //Get current element
      if (current.dataset.createdAt < parseInt(checkin.get('createdAt'), 10)) { //If checkin was earlier, than current element
        current.insertAdjacentHTML('beforebegin', _.template(checkinTemplate, checkin)); // Add this checkin before current element
        addedElement = current.previousSibling; //Acquire added element
        break; //Break the loop
      }
    }
    if (null === addedElement) {
      _recentCheckinElement.insertAdjacentHTML('beforeend', _.template(checkinTemplate, checkin));
      addedElement = _recentCheckinElement.lastChild; //We inserted html, it should become lastChild
    }

    //Add on click event
    addedElement.addEventListener('click', _showVenue);
  };

  /**
    Method removes Recent from DOM and unbinds events.

    @method _remove
    @for Recent
    @static
    @private
  */
  _remove = function () {
    var list,
      listLenght,
      i;

    if (_fetch !== undefined &&
        typeof (_fetch.abort) === 'function') {
      _fetch.abort();
    }
    _recent.off('add', _add);
    $('body > section > header > menu > a').off('click', _searchVenue);
    $('body > section > header > menu').remove();
    //$('.recent li').off('click', _showVenue);
    list = document.getElementById('recent-checkins-list').children;
    listLenght = list.length;

    for (i = 0; i < listLenght; i += 1) {
      list[i].removeEventListener('click', _showVenue);
    }
  };

  /**
    Recent view that is extension of [Backbone.View](http://backbonejs.org/#View).

    @class Recent
    @namespace View
    @extends Backbone.View
  */
  return Backbone.View.extend({
    /**
      Method is called when new Recent object is created. It points to {{#crossLink "Recent/_initialize"}}{{/crossLink}} method.

      @method initialize
      @for Recent
      @constructor
    */
    initialize: _initialize,
    /**
      Method points to {{#crossLink "Drawer/_remove"}}{{/crossLink}} method.

      @method remove
      @for Recent
    */
    remove: _remove
  });
});
