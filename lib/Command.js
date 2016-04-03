'use strict';

var _ = require('lodash');

module.exports = Command;

function Command(command, parameters, options) {
  if (!_.isString(command)) {
    throw new Error('Invalid command given');
  }

  parameters = parameters || [];

  if (!_.isArray(parameters)) {
    throw new Error('Parameters should be an array');
  }

  options = options || {
    stdio: 'inherit'
  };

  // Define properties
  this.command = command;
  this.parameters = parameters;
  this.options = options;
  this.silent = false;

  this.stdoutCallback = undefined;
  this.stderrCallback = undefined;
  this.finishedCallback = undefined;
}
