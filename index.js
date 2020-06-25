Array.prototype.shuffle = function() {
  this.sort(() => Math.random() - 0.5);
}

Array.prototype.contains = function(a) {
  return this.indexOf(a) != -1;
}

Array.prototype.mapIndex = function(index) {
  return (index % this.length + this.length) % this.length;
}

Array.prototype.copy = function(shallow = false) {
  if (shallow) return [...this];
  let copy = [];
  this.forEach(e => {
    if (Array.isArray(e)) {
      copy.push(e.copy());
    } else {
      if (typeof e === 'object') {
        copy.push(e.copy());
      } else {
        copy.push(e);
      }
    }
  });
  return copy;
}

Object.prototype.copy = function(shallow = false) {
  if (shallow) return Object.assign({}, this);
  let copy = {};
  for (let [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      copy[key] = value.copy();
    } else {
      if (typeof value === 'object') {
        copy[key] = value.copy();
      } else {
        copy[key] = value
      }
    }
  }
  return copy;
}

function randInt(max, min = 0) {
  return Math.floor(Math.random() * (max - min) + min);
}

function solveGrid(data) {
  let j = 0, k = 0;
  for (let i = 0; i < 81; i++) {
    j = Math.floor(i / 9);
    k = i % 9;
    let l = Math.floor(Math.floor(i / 9) / 3);
    let m = Math.floor(i % 9 / 3);
    if (data.grid[j][k] == 0) {
      let col = [].concat(data.grid[0][k], data.grid[1][k], data.grid[2][k], data.grid[3][k], data.grid[4][k], data.grid[5][k], data.grid[6][k], data.grid[7][k], data.grid[8][k]);
      let row = data.grid[j];
      let sqr = [].concat(data.grid[l * 3].slice(m * 3, m * 3 + 3), data.grid[l * 3 + 1].slice(m * 3, m * 3 + 3), data.grid[l * 3 + 2].slice(m * 3, m * 3 + 3));
      for (let value of Sudoku.NUMBERS) {
        if (isNaN(value)) value = parseInt(value);
        if (!row.contains(value)) {
          if (!col.contains(value)) {
            if (!sqr.contains(value)) {
              data.grid[j][k] = value;
              if (checkGrid(data.grid)) {
                data.counter++;
                data.solution = data.grid.copy();
                break;
              } else if (solveGrid(data)) {
                return true;
              }
            }
          }
        }
      }
      break;
    }
  }
  data.grid[j][k] = 0;
}

function checkGrid(grid) {
  for (let row of grid) {
    if (row.contains(0)) {
      return false;
    }
  }
  return true;
}

function fillGrid(grid) {
  let numbers = [...Sudoku.NUMBERS];
  let j = 0, k = 0;
  for (let i = 0; i < 81; i++) {
    // i = j + k * 9
    j = Math.floor(i / 9);
    k = i % 9;
    let l = Math.floor(Math.floor(i / 9) / 3);
    let m = Math.floor(i % 9 / 3);
    if (grid[j][k] == 0) {
      let col = [].concat(grid[0][k], grid[1][k], grid[2][k], grid[3][k], grid[4][k], grid[5][k], grid[6][k], grid[7][k], grid[8][k]);
      let row = grid[j];
      let sqr = [].concat(grid[l * 3].slice(m * 3, m * 3 + 3), grid[l * 3 + 1].slice(m * 3, m * 3 + 3), grid[l * 3 + 2].slice(m * 3, m * 3 + 3));
      numbers.shuffle();
      for (let value of numbers) {
        if (isNaN(value)) value = parseInt(value);
        if (!row.contains(value)) {
          if (!col.contains(value)) {
            if (!sqr.contains(value)) {
              grid[j][k] = value;
              if (checkGrid(grid)) {
                return true;
              } else if (fillGrid(grid)) {
                return true;
              }
            }
          }
        }
      }
      break;
    }
  }
  grid[j][k] = 0;
}

class Sudoku {
  constructor(board, type, difficulty) {
    this.type = type;
    this.difficulty = difficulty;
    this.board = board;
    this.status = 0;
  }

  static generate(options) {
    return new Promise((resolve, reject) => {
      try {
        let type = Sudoku.TYPES[0];
        let difficulty = Sudoku.DIFFICULTIES[0];
        let grid = [
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0]
        ];

        if (options.type != undefined) type = isNaN(options.type) ? options.type : Object.keys(Sudoku.TYPES)[options.type];
        if (options.difficulty != undefined) difficulty = isNaN(options.difficulty) ? options.difficulty : Object.keys(Sudoku.DIFFICULTIES)[options.difficulty];
        if (difficulty == "random") difficulty = Sudoku.getRandomDifficulty();

        fillGrid(grid);

        let attempts = 30;
        let emptyValues = 0;
        while(emptyValues <= Sudoku.DIFFICULTIES[difficulty] && attempts > 0) {
          let i = randInt(9);
          let j = randInt(9);
          while (grid[i][j] == 0) {
            i = randInt(9);
            j = randInt(9);
          }
          let l = 8 - i;
          let m = 8 - j;
          let backups = [grid[i][j], grid[l][m]];

          grid[i][j] = 0;
          grid[l][m] = 0;

          let data = {
            grid: grid.copy(),
            counter: 0
          };
          solveGrid(data);
          if (data.counter != 1) {
            grid[i][j] = backups[0];
            grid[l][m] = backups[1];
            attempts -= 1;
          } else {
            attempts = 30;
          }
        }

        switch(type) {
          case "rows":
            break;
          case "columns":
            var newGrid = [[],[],[],[],[],[],[],[],[]];
            for (let i = 0; i < 81; i++) {
              let j = Math.floor(i / 9);
              let k = i % 9;
              newGrid[k][j] = grid[j][k];
            }
            grid = newGrid;
            break;
          case "nonets":
            var newGrid = [[],[],[],[],[],[],[],[],[]];
            for (let i = 0; i < 9; i++) {
              let l = Math.floor(i / 3);
              let m = Math.floor(i % 3);
              newGrid[i] = [].concat(grid[l * 3].slice(m * 3, m * 3 + 3), grid[l * 3 + 1].slice(m * 3, m * 3 + 3), grid[l * 3 + 2].slice(m * 3, m * 3 + 3));
            }
            grid = newGrid;
            break;
        }

        resolve(new Sudoku(grid, type, difficulty).is(Sudoku.FLAGS.VALID, true).is(Sudoku.FLAGS.UNSOLVED, true));
      } catch(err) {
        reject(err);
      }
    });
  }

  static serialize(flag) {
		if (isNaN(flag)) {
			flag = flag.toUpperCase();
			if (this.FLAGS[flag]) {
				flag = this.FLAGS[flag];
			} else {
				flag = 0b0;
			}
		}

		if (Number(flag >>> 0).toString(2).length > Number(this.ALL >>> 0).toString(2).length) {
			flag = 0b0;
		}

		return flag;
	}

  static validate(grid, type) {
    return new Promise((resolve, reject) => {
      this.solve([...grid], type).then(sudoku => {
        resolve({
          "status": sudoku.status
        });
      }).catch(reject);
    });
  }

  static grade(grid) {
    return new Promise((resolve, reject) => {
      try {
        let emptyValues = 0;
        for (let i = 0; i < 81; i++) {
          let j = Math.floor(i / 9);
          let k = i % 9;
          if (grid[j][k] != 0) continue;
          emptyValues++;
        }
        let difficulty = this.DIFFICULTIES[1];
        for (let diff in this.DIFFICULTIES) {
          if (emptyValues > this.DIFFICULTIES[diff]) continue;
          difficulty = diff;
          break;
        }
        resolve({
          "difficulty": difficulty
        });
      } catch(err) {
        reject(err);
      }
    });
  }

  static solve(grid, type) {
    return new Promise(async (resolve, reject) => {
      try {
        switch(type) {
          case "rows":
            break;
          case "columns":
            var newGrid = [[],[],[],[],[],[],[],[],[]];
            for (let i = 0; i < 81; i++) {
              let j = Math.floor(i / 9);
              let k = i % 9;
              newGrid[k][j] = grid[j][k];
            }
            grid = newGrid;
            break;
          case "nonets":
            var newGrid = [[],[],[],[],[],[],[],[],[]];
            for (let i = 0; i < 9; i++) {
              let l = Math.floor(i / 3);
              let m = Math.floor(i % 3);
              newGrid[i] = [].concat(grid[l * 3].slice(m * 3, m * 3 + 3), grid[l * 3 + 1].slice(m * 3, m * 3 + 3), grid[l * 3 + 2].slice(m * 3, m * 3 + 3));
            }
            grid = newGrid;
            break;
        }

        let {difficulty} = await this.grade(grid);

        let data = {
          grid: grid.copy(),
          counter: 0
        };
        solveGrid(data);

        grid = data.solution || data.grid;

        switch(type) {
          case "rows":
            break;
          case "columns":
            var newGrid = [[],[],[],[],[],[],[],[],[]];
            for (let i = 0; i < 81; i++) {
              let j = Math.floor(i / 9);
              let k = i % 9;
              newGrid[k][j] = grid[j][k];
            }
            grid = newGrid;
            break;
          case "nonets":
            var newGrid = [[],[],[],[],[],[],[],[],[]];
            for (let i = 0; i < 9; i++) {
              let l = Math.floor(i / 3);
              let m = Math.floor(i % 3);
              newGrid[i] = [].concat(grid[l * 3].slice(m * 3, m * 3 + 3), grid[l * 3 + 1].slice(m * 3, m * 3 + 3), grid[l * 3 + 2].slice(m * 3, m * 3 + 3));
            }
            grid = newGrid;
            break;
        }
        let sudoku = new Sudoku(grid, type, difficulty).is(data.counter != 0 ? Sudoku.FLAGS.SOLVED : Sudoku.FLAGS.UNSOLVED, true).is(data.counter == 1 ? Sudoku.FLAGS.VALID : Sudoku.FLAGS.INVALID, true);

        resolve(sudoku);
      } catch(err) {
        reject(err);
      }
    });
  }

  static get NUMBERS() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  static get TYPES() {
    return {
      rows: 0,
      columns: 1,
      nonets: 2
    };
  }

  static get DIFFICULTIES() {
    return {
      random: 0,
      beginner: 50,
      intermediate: 55,
      advanced: 57,
      expert: 60
    };
  }

  static get FLAGS() {
    return {
      VALID: 0b1,
      INVALID: 0b10,
      SOLVED: 0b100,
      UNSOLVED: 0b1000
    };
  }

  static getRandomDifficulty() {
    let arr = Object.keys(this.DIFFICULTIES).slice(1);
    return arr[Math.floor(Math.random() * arr.length)];
  }

  get statusBits() {
    return Number(this.status >>> 0).toString(2);
  }

  is(flag, value) {
    if (value != undefined) {
      flag = this.constructor.serialize(flag);
      if (value && !this.is(flag)) this.status += flag;
      else if (!value && this.is(flag)) this.status -= flag;
      return this;
    } else {
      flag = Number(this.constructor.serialize(flag) >>> 0).toString(2);
      return Number(this.statusBits.substring(this.statusBits.length - flag.length, this.statusBits.length - flag.length + 1)) === 1;
    }
  }

  validate() {
    return Sudoku.validate(this.board, this.type);
  }

  grade() {
    return Sudoku.grade(this.board);
  }

  solve() {
    return Sudoku.solve(this.board, this.type);
  }
}

module.exports = Sudoku;
