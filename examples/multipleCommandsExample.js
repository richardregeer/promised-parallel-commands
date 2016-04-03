'use strict';

var Command = require('../lib/Command');
var CommandRunner = require('../lib/CommandRunner');

var commandRunner = new CommandRunner(require('child_process').spawn, process);

var command1 = new Command('ls', ['-la']);
var command2 = new Command('pwd');

commandRunner.runCommand([command1, command2], 2)
  .then(function () {
    console.log('Done');
  });
