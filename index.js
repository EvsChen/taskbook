#!/usr/bin/env node
'use strict';
const taskbook = require('./src/taskbook');
const prompts = require('prompts');

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

  while (true) {
    process.stdout.write('\x1Bc');
    taskbook.displayByBoard();
    taskbook.displayStats();
    const res = await prompts({
      type: 'text',
      name: 'prop',
      message: 'What is the meaning of life?'
    });
    response = res.prop;
    if (response === 'exit') {
      break;
    }
    taskbookCLI(response.split(' '), { task: true });
  }
};

module.exports = taskbookCLI;
