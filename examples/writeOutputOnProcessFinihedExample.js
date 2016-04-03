'use strict';

var Command = require('promised-parallel-commands').Command;
var commandRunner = require('promised-parallel-commands').createCommandRunner();

var command = new Command('ls');
var command2 = new Command('ls', ['-a']);
var command3 = new Command('ls', ['-l']);

command.silent = true;

command.finishedCallback = function (command, code, output) {
  console.log(output);
};

commandRunner.runCommand([command, command2, command3], 3)
  .then(function () {
    console.log('Done');
  });
