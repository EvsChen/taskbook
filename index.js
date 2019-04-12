#!/usr/bin/env node
'use strict';
const taskbook = require('./src/taskbook');
const autocomplete = require('prompts/lib/elements/autocomplete');

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
const boards = taskbook._getBoards();
const boardChoices = boards
  .filter(b => b !== 'My Board')
  .map(b => ({ title: b.slice(1) }));
const flagChoices = flagKeys.map(key => ({ title: key }));

function onTabPress() {
  if (this.select === this.suggestions[this.page].length - 1) {
    const inputArr = this.input.split(' ');
    const lastPart = inputArr[inputArr.length - 1];
    this.page = (this.page + 1) % this.suggestions.length;
    const selected = this.suggestions[this.page][0].title;
    const enteredPart = lastPart.startsWith('@') ? lastPart.slice(1) : lastPart;
    // Append the input with the sliced completion
    this.input += selected.slice(enteredPart.length) + ' ';
    this.cursor += selected.length - enteredPart.length + 1;
    this.moveSelect(0);
    this.render();
  } else {
    this.moveSelect(this.select + 1);
    this.render();
  }
}

function suggest(input) {
  const arr = input.split(' ');
  if (arr[arr.length - 1].startsWith('@')) {
    if (!this.chooseBoards) {
      this.chooseBoards = true;
      this.choices = boardChoices;
    }
    return Promise.resolve(
      this.choices.filter(({ title }) => {
        const strAfterAt = arr[arr.length - 1].slice(1);
        return title.slice(0, strAfterAt.length).toLowerCase() === strAfterAt.toLowerCase()
      })
    )
  }
  if (this.chooseBoards) {
    this.chooseBoards = false;
    this.choices = flagChoices;
  }
  return Promise.resolve(
    this.choices.filter(({ title }) => {
      const firstPart = arr[0];
      return title.slice(0, firstPart.length).toLowerCase() === firstPart.toLowerCase()
    })
  )
}

const taskbookCLI = async () => {
  let flags = {}, input = "", response = '';
  process.stdout.write('\x1Bc');
  taskbook.displayByBoard();
  taskbook.displayStats();

  while (true) {
    if (!isRenderCommand(flags)) {
      const arr = historyCommands.filter(c => isRenderCommand(c.flags));
      const lastRenderFlag = arr.length > 0 ? arr[arr.length - 1].flags : {};
      executeCommand("", lastRenderFlag);
    }

    response = await new Promise((resolve) => {
      const p = new autocomplete({
        message: '>',
        choices: flagChoices.slice(0),
        // Compare the input and the choices by the first "word"
        suggest,
        onRender: function() {
          this.value = this.input;
        }
      });
      p.next = onTabPress;
      p.on('submit', v => resolve(v));
    });
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
