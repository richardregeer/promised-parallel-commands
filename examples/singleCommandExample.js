'use strict';

var Command = require('promised-parallel-commands').Command;
var commandRunner = require('promised-parallel-commands').createCommandRunner();

var command = new Command('ls', ['-la']);

commandRunner.runCommand(command)
  .then(function () {
    console.log('Done');
  });
