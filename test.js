const sudoku = require("./index");

sudoku.generate({type:"rows", difficulty:"beginner"}).then(console.log).catch(console.warn);
