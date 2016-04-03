'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

var spawner, processReference;

module.exports = CommandRunner;

function CommandRunner(processSpawner, globalProcess) {
  if (_.isUndefined(processSpawner)) {
    throw new Error('processSpawner is not assigned');
  }

  if (_.isUndefined(globalProcess)) {
    throw new Error('globalProcess is not assigned');
  }

  processReference = globalProcess;
  spawner = processSpawner;

  Promise.config({
    cancellation: true
  });
}

CommandRunner.prototype.runCommand = Promise.method(function runCommand(commands, concurrency) {
  var spawnedProcesses = [];
  var outputBuffer = '';

  if (_.isEmpty(commands)) {
    throw new Error('no commands found to run');
  }

  if (!_.isArray(commands)) {
    commands = [commands];
  }

  var commandQueuePromise = Promise.map(commands, function (command) {
    return promisifyCommand(command, spawnedProcesses)
      .then(function (processOutputBuffer) {
        outputBuffer += processOutputBuffer;
      });
  }, {
    concurrency: concurrency || 1
  }).then(function () {
    return outputBuffer;
  });

  processReference.on('SIGINT', function () {
    disposeSpawnedProcesses(spawnedProcesses, commandQueuePromise);
  });

  processReference.on('SIGTERM', function () {
    disposeSpawnedProcesses(spawnedProcesses, commandQueuePromise);
  });

  return commandQueuePromise;
});

function promisifyCommand(command, spawnedProcesses) {
  return new Promise(function (resolve) {
    var spawnedProcess = spawner(command.command, command.parameters, command.options);
    var outputBuffer = '';

    spawnedProcesses.push(spawnedProcess);

    if (!_.isEmpty(spawnedProcess.stdout)) {
      spawnedProcess.stdout.on('data', function (data) {
        outputBuffer += data;

        if (_.isFunction(command.stdoutCallback)) {
          return command.stdoutCallback(command, data);
        }

        if (!command.silent) {
          processReference.stdout.write(data.toString());
        }
      });
    }

    if (!_.isEmpty(spawnedProcess.stderr)) {
      spawnedProcess.stderr.on('data', function (data) {
        if (_.isFunction(command.stderrCallback)) {
          return command.stderrCallback(command, data);
        }

        if (!command.silent) {
          processReference.stderr.write(data.toString());
        }
      });
    }

    spawnedProcess.on('close', function (code) {
      if (_.isFunction(command.finishedCallback)) {
        command.finishedCallback(command, code, outputBuffer);
      }

      resolve(outputBuffer);
    });
  });
}

function disposeSpawnedProcesses(spawnedProcesses, commandQueuePromise) {
  if (!commandQueuePromise.isCancelled()) {
    commandQueuePromise.cancel();
  }

  _.forEach(spawnedProcesses, function (spawnedProcess) {
    spawnedProcess.kill();
  });
}
