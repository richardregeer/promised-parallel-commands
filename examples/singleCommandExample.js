'use strict';

var Command = require('../lib/Command');
var CommandRunner = require('../lib/CommandRunner');

var commandRunner = new CommandRunner(require('child_process').spawn, process);

var command = new Command('ls', ['-la']);

commandRunner.runCommand(command)
  .then(function () {
    console.log('Done');
  });
