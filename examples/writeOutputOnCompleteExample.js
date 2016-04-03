'use strict';

var Command = require('../lib/Command');
var CommandRunner = require('../lib/CommandRunner');

var commandRunner = new CommandRunner(require('child_process').spawn, process);

var command = new Command('ls', ['-la']);

command.silent = true;

commandRunner.runCommand(command)
  .then(function (output) {
    console.log(output);
  });
