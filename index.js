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
  smartlist: true,
  sl: true,
  delay: true,
  clear: {
    type: 'boolean'
  }
};

function isRenderCommand(flags) {
  return flags && (flags.timeline || flags.smartlist || flags.sl || Object.keys(flags).length === 0);
}

const flagKeys = Object.keys(flags);
const historyCommands = [];

function onTabPress() {
  if (this.select === this.suggestions[this.page].length - 1) {
    let prevInput = this.input;
    this.page = (this.page + 1) % this.suggestions.length;
    this.input = this.suggestions[this.page][0].title + ' ';
    this.cursor += this.input.length - prevInput.length;
    this.moveSelect(0);
    this.render();
  } else {
    this.moveSelect(this.select + 1);
    this.render();
  }
}

const taskbookCLI = async () => {
  let response = '';
  let flags = {};
  let input = "";
  process.stdout.write('\x1Bc');
  taskbook.displayByBoard();
  taskbook.displayStats();

  while (true) {
    if (!isRenderCommand(flags)) {
      const arr = historyCommands.filter(c => isRenderCommand(c.flags));
      const lastRenderFlag = arr.length > 0 ? arr[arr.length - 1].flags : {};
      executeCommand("", lastRenderFlag);
    }
    const res = await prompts({
      type: 'autocomplete',
      name: 'prop',
      message: '>',
      choices: flagKeys.map(key => ({ title: key })),
      // Compare the input and the choices by the first "word"
      suggest: (input, choices) => Promise.resolve(
        choices.filter(item => {
          const firstPart = input.split(" ")[0];
          return item.title.slice(0, firstPart.length).toLowerCase() === firstPart.toLowerCase()
        })
      ),
      onRender: function() {
        // Only set this at the first time for performance
        if (this.firstRender) {
          this.next = onTabPress;
        }
        this.value = this.input;
      }
    });
    response = res.prop;
    if (response === 'exit') break;
    const inputArr = response.split(' ').filter(i => i.length > 0);
    input = parseInput(inputArr).input;
    flags = parseInput(inputArr).flags;
    process.stdout.write('\x1Bc');
    executeCommand(input, flags);
  }
};

function parseInput(inputArr) {
  return flags[inputArr[0]]
    ? { input: inputArr.slice(1), flags: { [inputArr[0]]: true }}
    : { input: inputArr, flags: {} };
}

function executeCommand(input, flags) {
  historyCommands.push({input, flags});

  if (Object.keys(flags).length === 0) {
    taskbook.displayByBoard();
    return taskbook.displayStats();
  }

  if (flags.smartlist || flags.sl) {
    taskbook.displaySmartList();
    return taskbook.displayStats();
  }

  if (flags.archive) {
    return taskbook.displayArchive();
  }

  if (flags.delay) {
    return taskbook.delayTasks(input);
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
}

module.exports = taskbookCLI;
