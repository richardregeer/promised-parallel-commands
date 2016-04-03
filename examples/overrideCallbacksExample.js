'use strict';

var Command = require('../lib/Command');
var CommandRunner = require('../lib/CommandRunner');

var commandRunner = new CommandRunner(require('child_process').spawn, process);

var command = new Command('ls', ['-la']);

command.silent = true;

command.finishedCallback = function (command, code) {
  console.log('Process done: ' + code);
};

command.stdoutCallback = function (command, data) {
  console.log(data);
};

commandRunner.runCommand(command)
  .then(function () {
    console.log('Done');
  });
