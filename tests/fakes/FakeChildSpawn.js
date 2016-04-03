'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function FakeChildSpawn() {
  EventEmitter.call(this);
  this.stdout = new EventEmitter();
  this.stderr = new EventEmitter();
}

util.inherits(FakeChildSpawn, EventEmitter);

FakeChildSpawn.prototype.kill = function () {};

module.exports = FakeChildSpawn;
