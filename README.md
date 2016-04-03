# promised-parallel-commands
This library can spawn multiple processes in parallel and wrap them in a promise.
The amount of concurrent processes can be given to the command runner.

On default the output of the commands is shown in the stdout of the main process. It's possible to override the output via callbacks on the command.

# Setup
The library can be added as a dependency in your package.json of your project.
```bash
npm install --save promised-parallel-commands
```
# Command
The command is a object that represents the cli command. It has the following parameters:
 - **command**: The cli command is mandatory and must be a string.
 - **parameters**: The parameters to apply, in an array.
 - **options**: The options of the spawned process. For more information see the [nodejs](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) documentation. On default inherited will be used. This will output everything the the main process.

The output can be silenced by setting **silence** to true.

The following callbacks are available to be override:
 - finishedCallback: called when the process is finished.
 - stdoutCallback: called when data is written to stdout.
 - stderrCallback: called when data is written to stderr.

Code example:
```js
var command = new Command('ls', ['-la']);

command.silent = true;

command.finishedCallback = function (command, code, output) {
  console.log('Process done: ' + code);
};

command.stdoutCallback = function (command, data) {
  console.log(data);
};
```

# CommandRunner
The CommandRunner is the core of this library. The CommandRunner can spawn multiple processes and returns a promise.

Use **createCommandRunner** to create a new object.
Use runCommand to execute the given commands. Use an array to be able to pass multiple commands. The amount of concurrent processes can be given to the runCommand method. On default 1 concurrent process will be used.  

runCommand will return a promise that will be fulfilled if all the processes are done. If the main process is killed or interrupted all the child processes will be killed.

Code example:
```js
var command1 = new Command('ls', ['-la']);
var command2 = new Command('pwd');

commandRunner.runCommand([command1, command2], 2)
  .then(function () {
    console.log('Done');
  });
```

# Examples
More code examples can be found in the [examples](https://github.com/richardregeer/promised-parallel-commands/tree/master/examples) folder.

# Tests
The tests are using [mocha](https://github.com/mochajs/mocha).
The tests can be run using gulp:
```js
gulp tests
```
Run the tests with coverage:
```js
gulp tests-coverage
```
