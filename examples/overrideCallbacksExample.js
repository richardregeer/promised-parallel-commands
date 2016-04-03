'use strict';

var Command = require('promised-parallel-commands').Command;
var commandRunner = require('promised-parallel-commands').createCommandRunner();

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
