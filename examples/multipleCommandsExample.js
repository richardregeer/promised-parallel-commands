'use strict';

var Command = require('promised-parallel-commands').Command;
var commandRunner = require('promised-parallel-commands').createCommandRunner();

var command1 = new Command('ls', ['-la']);
var command2 = new Command('pwd');

commandRunner.runCommand([command1, command2], 2)
  .then(function () {
    console.log('Done');
  });
