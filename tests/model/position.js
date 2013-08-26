define([
  'model/position'
], function (Position) {
  'use strict';

  module('model.position');

  test('module', function() {
    deepEqual(typeof Position, 'function', 'module is loaded');
    deepEqual(typeof new Position(), 'object', 'constructor returns object');
  });

  test('defaults', function() {
    var position = new Position();

    notDeepEqual(position.get('gps'), undefined, '`gps` is defined');
    notDeepEqual(position.get('checkin'), undefined, '`checkin` is defined');
    notDeepEqual(position.get('service'), undefined, '`service` is defined');
  });
});
