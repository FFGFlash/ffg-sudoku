Array.prototype.shuffle = function() {
  this.sort(() => Math.random() - 0.5);
}

Array.prototype.contains = function(a) {
  return this.indexOf(a) != -1;
}

Array.prototype.mapIndex = function(index) {
  return (index % this.length + this.length) % this.length;
}

function randInt(max, min = 0) {
  return Math.floor(Math.random() * (max - min) + min);
}

class Sudoku {
  constructor(grid, type, difficulty) {
    this.type = type;
    this.difficulty = difficulty;
    this.grid = grid;
  }

  static generate(options) {
    return new Promise((resolve, reject) => {
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

      if (options.type != undefined) type = isNaN(options.type) ? options.type : Sudoku.TYPES[options.type];
      if (options.difficulty != undefined) difficulty = isNaN(options.difficulty) ? options.difficulty : Sudoku.DIFFICULTIES[options.difficulty];
      if (difficulty == "random") difficulty = Sudoku.getRandomDifficulty();

      let numbers = Sudoku.NUMBERS;
      let counter = 1;

      function solveGrid(grid) {
        let j = 0, k = 0;
        for (let i = 0; i < 81; i++) {
          j = Math.floor(i / 9);
          k = i % 9;
          let l = Math.floor(Math.floor(i / 9) / 3);
          let m = Math.floor(i % 9 / 3);
          if (grid[j][k] == 0) {
            let col = [].concat(grid[0][k], grid[1][k], grid[2][k], grid[3][k], grid[4][k], grid[5][k], grid[6][k], grid[7][k], grid[8][k]);
            let row = grid[j];
            let sqr = [].concat(grid[l * 3].slice(m * 3, m * 3 + 3), grid[l * 3 + 1].slice(m * 3, m * 3 + 3), grid[l * 3 + 2].slice(m * 3, m * 3 + 3));
            for (let value of Sudoku.NUMBERS) {
              if (isNaN(value)) value = parseInt(value);
              if (!row.contains(value)) {
                if (!col.contains(value)) {
                  if (!sqr.contains(value)) {
                    grid[j][k] = value;
                    if (checkGrid(grid)) {
                      counter++;
                      break;
                    } else if (solveGrid(grid)) {
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

      function checkGrid(grid) {
        for (let row of grid) {
          if (row.contains(0)) {
            return false;
          }
        }
        return true;
      }

      function fillGrid(grid) {
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

      fillGrid(grid);

      let diffValues = {
        "beginner": 50,
        "intermediate": 55,
        "advanced": 57,
        "expert": 60
      };

      let attempts = 10;
      let emptyValues = 0;
      while(emptyValues <= diffValues[difficulty] && attempts > 0) {
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

        counter = 0;
        solveGrid([...grid]);
        if (counter != 1) {
          grid[i][j] = backups[0];
          grid[l][m] = backups[1];
          attempts -= 1;
        } else {
          attempts = 10;
        }
      }

      switch(type) {
        case "rows":
          break;
        case "columns":
          let columnGrid = [[],[],[],[],[],[],[],[],[]];
          for (let i = 0; i < 81; i++) {
            let j = Math.floor(i / 9);
            let k = i % 9;
            columnGrid[k][j] = grid[j][k];
          }
          grid = columnGrid;
          break;
        case "nonets":
          let nonetGrid = [[],[],[],[],[],[],[],[],[]];
          for (let i = 0; i < 9; i++) {
            let l = Math.floor(i / 3);
            let m = Math.floor(i % 3);
            nonetGrid[i] = [].concat(grid[l * 3].slice(m * 3, m * 3 + 3), grid[l * 3 + 1].slice(m * 3, m * 3 + 3), grid[l * 3 + 2].slice(m * 3, m * 3 + 3));
          }
          grid = nonetGrid;
          break;
      }

      resolve(new Sudoku(grid, type, difficulty));
    });
  }

  static validate(grid) {

  }

  static grade(grid) {

  }

  static solve(grid) {

  }

  static get NUMBERS() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  static get TYPES() {
    return [
      "rows",
      "columns",
      "nonets"
    ];
  }

  static get DIFFICULTIES() {
    return [
      "random",
      "beginner",
      "intermediate",
      "advanced",
      "expert"
    ];
  }

  static getRandomDifficulty() {
    let arr = this.DIFFICULTIES.slice(1);
    return arr[Math.floor(Math.random() * arr.length)];
  }

  validate() {
    return Sudoku.validate(this);
  }

  grade() {
    return Sudoku.grade(this);
  }

  solve() {
    return Sudoku.solve(this);
  }
}

module.exports = Sudoku;
