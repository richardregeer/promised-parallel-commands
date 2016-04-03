'use strict';

var assert = require('chai').assert;
var Command = require('../../lib/Command');

module.exports['Command tests'] = {
  'Should throw an error if invalid command is given to runCommand': function () {
    var command;

    assert.throw(function assertError() {
      command = new Command();
    }, Error);
  },
  'Should throw an error if given parameters are not in a array': function () {
    var command;

    assert.throw(function assertError() {
      command = new Command('ls', '-l');
    }, Error);
  },
  'Should use default parameters if none given to runCommand': function () {
    var command;

    command = new Command('ls');

    assert.deepEqual(command.parameters, []);
  },
  'Should use default inherit options if none given to runCommand': function () {
    var command;

    command = new Command('ls');

    assert.deepEqual(command.options, {
      stdio: 'inherit'
    });
  },
  'Created command should not be silent by default': function () {
    var command;

    command = new Command('ls');

    assert.isFalse(command.silent);
  }
};
