'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var FakeChildSpawn = require('../fakes/FakeChildSpawn');
var EventEmitter = require('events').EventEmitter;
var CommandRunner = require('../../lib/CommandRunner');
var Command = require('../../lib/Command');

chai.use(chaiAsPromised);
var assert = chai.assert;

var command, commandRunner, fakeChildSpawn, fakeProcessEventEmitter, processStdoutStub,
  processStderrStub, spawnStub, sandbox;

module.exports['Create command runner tests'] = {
  'Should throw an error if no spawn function is given to the constructor': function () {
    var command;

    assert.throw(function assertError() {
      command = new CommandRunner();
    }, Error);
  },
  'Should throw an error if no process global is given to the constructor': function () {
    var command;

    assert.throw(function assertError() {
      command = new CommandRunner({
        stdout: {},
        stderr: {}
      });
    }, Error);
  }
};

module.exports['Run command runner tests'] = {
  beforeEach: function () {
    sandbox = sinon.sandbox.create();

    command = new Command('ls', [], {});
    fakeChildSpawn = new FakeChildSpawn();
    fakeProcessEventEmitter = new EventEmitter();
    spawnStub = sandbox.stub();
    spawnStub.returns(fakeChildSpawn);

    processStdoutStub = sandbox.stub({
      on: function () {},
      write: function () {}
    });
    processStderrStub = sandbox.stub({
      on: function () {},
      write: function () {}
    });
    fakeProcessEventEmitter.stdout = processStdoutStub;
    fakeProcessEventEmitter.stderr = processStderrStub;

    commandRunner = new CommandRunner(spawnStub, fakeProcessEventEmitter);
  },
  afterEach: function () {
    sandbox.restore();
  },
  'Should throw an error if invalid command is given to runCommand': function () {
    return assert.isRejected(commandRunner.runCommand(), Error);
  },
  'If output is not inherited print to the output buffer of the spawned process': function () {
    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.stdout.emit('data', new Buffer('test'));
    fakeChildSpawn.emit('close');

    return promise.then(function assertResult() {
      assert.strictEqual(processStdoutStub.write.callCount, 1);
      assert.isTrue(processStdoutStub.write.calledWith('test'));
    });
  },
  'If error output is not inherited print to the error output buffer of the spawned process': function () {
    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.stderr.emit('data', new Buffer('error'));
    fakeChildSpawn.emit('close');

    return promise.then(function assertResult() {
      assert.strictEqual(processStderrStub.write.callCount, 1);
      assert.isTrue(processStderrStub.write.calledWith('error'));
    });
  },
  'Should use the stdout callback if assigned in the command': function () {
    command.stdoutCallback = function (commandResult, data) {
      assert.deepEqual(commandResult, command);
      assert.strictEqual(data.toString(), 'test');
    };

    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.stdout.emit('data', new Buffer('test'));
    fakeChildSpawn.emit('close');

    return promise;
  },
  'Should use the stderr callback if assigned in the command': function () {
    command.stderrCallback = function (commandResult, data) {
      assert.deepEqual(commandResult, command);
      assert.strictEqual(data.toString(), 'error');
    };

    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.stderr.emit('data', new Buffer('error'));
    fakeChildSpawn.emit('close');

    return promise;
  },
  'Promise will be resolved if running one command is finished': function () {
    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.emit('close');

    return promise.then(function assertResult() {
      assert.strictEqual(spawnStub.callCount, 1);
      assert.strictEqual(spawnStub.firstCall.args[0], 'ls');
    });
  },
  'Run multiple commands that are resolved if all commands are finished': function () {
    var command1 = new Command('ls', [], {});
    var command2 = new Command('time', [], {});

    var promise = commandRunner.runCommand([command1, command2], 2);

    fakeChildSpawn.emit('close');

    return promise.then(function assertResult() {
      assert.strictEqual(spawnStub.callCount, 2);
      assert.strictEqual(spawnStub.getCall(0).args[0], 'ls');
      assert.strictEqual(spawnStub.getCall(1).args[0], 'time');
    });
  },
  'Should kill all the spawned processes if SIGTERM signal is recieved': function () {
    var spawnSpy = sandbox.spy(fakeChildSpawn, 'kill');

    commandRunner.runCommand([command, command, command], 5);
    fakeProcessEventEmitter.emit('SIGINT');

    assert.strictEqual(spawnSpy.callCount, 3);
  },
  'Should kill all the spawned processes if SIGINT signal is recieved': function () {
    var spawnSpy = sandbox.spy(fakeChildSpawn, 'kill');

    commandRunner.runCommand([command, command, command], 5);
    fakeProcessEventEmitter.emit('SIGTERM');

    assert.strictEqual(spawnSpy.callCount, 3);
  },
  'Should cancel the promise chain for spawned commands if SIGINT signal is recieved': function () {
    var result = commandRunner.runCommand([command]);

    result.then(function () {
      fakeProcessEventEmitter.emit('SIGTERM');
    })
    .then(function () {
      assert.isTrue(result.isCancelled());
    });
  },
  'Should suppress output if the command is silent': function () {
    command.silent = true;

    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.stdout.emit('data', new Buffer('test'));
    fakeChildSpawn.emit('close');

    return promise.then(function assertResult() {
      assert.isFalse(processStdoutStub.write.called);
    });
  },
  'Should suppress error output if the command is silent': function () {
    command.silent = true;

    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.stderr.emit('data', new Buffer('test'));
    fakeChildSpawn.emit('close');

    return promise.then(function assertResult() {
      assert.isFalse(processStderrStub.write.called);
    });
  },
  'Should use the finishedCallback if assigned to the the command': function () {
    command.finishedCallback = function (commandResult, code) {
      assert.deepEqual(commandResult, command);
      assert.strictEqual(code, 0);
    };

    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.emit('close', 0);

    return promise;
  },
  'Should return the output off the spawned process in the finishedCallback of the command': function () {
    command.finishedCallback = function (commandResult, code, output) {
      assert.strictEqual(output, 'test1test2test3');
    };

    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.stdout.emit('data', new Buffer('test1'));
    fakeChildSpawn.stdout.emit('data', new Buffer('test2'));
    fakeChildSpawn.stdout.emit('data', new Buffer('test3'));
    fakeChildSpawn.emit('close');

    return promise;
  },
  'Should return the combined output off all the spawned process if all completed': function () {
    var promise = commandRunner.runCommand(command);

    fakeChildSpawn.stdout.emit('data', new Buffer('test21'));
    fakeChildSpawn.stdout.emit('data', new Buffer('test22'));
    fakeChildSpawn.stdout.emit('data', new Buffer('test23'));

    fakeChildSpawn.emit('close');

    return promise.then(function (outputResult) {
      assert.strictEqual(outputResult, 'test21test22test23');
    });
  }
};
