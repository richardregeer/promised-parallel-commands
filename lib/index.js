'use strict';

module.exports = {
  Command: require('./Command'),
  createCommandRunner: function () {
    var CommandRunner = require('./CommandRunner');

    return new CommandRunner(require('child_process').spawn, process);
  }
};
