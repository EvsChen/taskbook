#!/usr/bin/env node
'use strict';
const taskbook = require('./src/taskbook');
const prompts = require('prompts');

const flags = {
  help: {
    type: 'boolean',
    alias: 'h'
  },
  version: {
    type: 'boolean',
    alias: 'v'
  },
  archive: {
    type: 'boolean',
    alias: 'a'
  },
  restore: {
    type: 'boolean',
    alias: 'r'
  },
  task: {
    type: 'boolean',
    alias: 't'
  },
  note: {
    type: 'boolean',
    alias: 'n'
  },
  delete: {
    type: 'boolean',
    alias: 'd'
  },
  check: {
    type: 'boolean',
    alias: 'c'
  },
  begin: {
    type: 'boolean',
    alias: 'b'
  },
  star: {
    type: 'boolean',
    alias: 's'
  },
  copy: {
    type: 'boolean',
    alias: 'y'
  },
  timeline: {
    type: 'boolean',
    alias: 'i'
  },
  priority: {
    type: 'boolean',
    alias: 'p'
  },
  find: {
    type: 'boolean',
    alias: 'f'
  },
  list: {
    type: 'boolean',
    alias: 'l'
  },
  edit: {
    type: 'boolean',
    alias: 'e'
  },
  move: {
    type: 'boolean',
    alias: 'm'
  },
  clear: {
    type: 'boolean'
  }
};

const taskbookCLI = async (input, flags) => {
  if (flags.archive) {
    return taskbook.displayArchive();
  }

  if (flags.task) {
    return taskbook.createTask(input);
  }

  if (flags.restore) {
    return taskbook.restoreItems(input);
  }

  if (flags.note) {
    return taskbook.createNote(input);
  }

  if (flags.delete) {
    return taskbook.deleteItems(input);
  }

  if (flags.check) {
    return taskbook.checkTasks(input);
  }

  if (flags.begin) {
    return taskbook.beginTasks(input);
  }

  if (flags.star) {
    return taskbook.starItems(input);
  }

  if (flags.priority) {
    return taskbook.updatePriority(input);
  }

  if (flags.copy) {
    return taskbook.copyToClipboard(input);
  }

  if (flags.timeline) {
    taskbook.displayByDate();
    return taskbook.displayStats();
  }

  if (flags.find) {
    return taskbook.findItems(input);
  }

  if (flags.list) {
    taskbook.listByAttributes(input);
    return taskbook.displayStats();
  }

  if (flags.edit) {
    return taskbook.editDescription(input);
  }

  if (flags.move) {
    return taskbook.moveBoards(input);
  }

  if (flags.clear) {
    return taskbook.clear();
  }

  let response = '';
  process.stdout.write('\x1Bc');

  while (true) {
    taskbook.displayByBoard();
    taskbook.displayStats();
    const res = await prompts({
      type: 'text',
      name: 'prop',
      message: 'Input command'
    });
    response = res.prop;
    if (response === 'exit') break;
    const { input, flags } = parseInput(response.split(' '));
    process.stdout.write('\x1Bc');
    taskbookCLI(input, flags);
  }
};

function parseInput(inputArr) {
  if (flags[inputArr[0]]) {
    return { input: inputArr.slice(1), flags: { [inputArr[0]]: true }};
  }
  return { input: inputArr, flags: {} };
}

module.exports = taskbookCLI;
