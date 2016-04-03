'use strict';

var Command = require('promised-parallel-commands').Command;
var commandRunner = require('promised-parallel-commands').createCommandRunner();

var command = new Command('ls', ['-la']);

command.silent = true;

commandRunner.runCommand(command)
  .then(function (output) {
    console.log(output);
  });
