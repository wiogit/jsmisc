class RandomUniqueWalker {
  #path;
  #indexMap;

  static fromPath(path) {
    const walker = new RandomUniqueWalker();
    walker.#path = [];
    walker.#indexMap = new Map();
    for (const cell of path) {
      walker.#walkTo(cell);
    }
    return walker;
  }
  
  static randomPoint() {
    const point = [0, 0];
    const randomCoord = Math.floor(Math.random() * 2);
    const randomDir = Math.floor(Math.random() * 2) * 2 - 1;
    point[randomCoord] = randomDir;
    return point;
  }

  #walkTo(cell) {
    this.#path.push(cell);
    this.#indexMap.set(cell.toString(), this.#path.length - 1);
  }

  #isEnclosed(p, start, ray) {
    const segments = [];
    const orth = ray[0] === 0 ? 0 : 1;
    const tan = 1 - orth;

    const end = this.#path.length - 1;
    for (let i = start; i <= end; i += 1) {
      const cell = this.#path[i];
      if (cell[orth] === p[orth]) {
        if ((cell[tan] - p[tan]) * ray[tan] > 0) {
          const segment = segments.at(-1);
          if (segment && segment[1] + 1 === i) {
            segment[1] = i;
          } else {
            segments.push([i, i]);
          }
        }
      }
    }

    let crossCount = 0;
    for (const [first, last] of segments) {
      const enter = this.#path[first - 1];
      const exit = this.#path[last + 1];
      if (enter[orth] !== exit[orth]) {
        crossCount += 1;
      }
    }
    return crossCount % 2 === 1;
  }

  constructor(n) {
    this.#path = [];
    this.#indexMap = new Map();
    this.#walkTo([0, 0]);
    this.#walkTo(RandomUniqueWalker.randomPoint());
    if (Number.isInteger(n) && n > 2) {
      this.advanceTo(n);
    }
  }

  get path() {
    return this.#path;
  }

  indexOf(cell) {
    return this.#indexMap.get(cell.toString());
  }

  advance() {
    const [x, y] = this.#path.at(-1);
    const [x0, y0] = this.#path.at(-2);
    const dx = x - x0;
    const dy = y - y0;

    const forward = [x + dx, y + dy];
    const left = [x + dy, y + dx];
    const right = [x - dy, y - dx];

    const fi = this.indexOf(forward);
    const li = this.indexOf(left);
    const ri = this.indexOf(right);

    // Case 1: Forward Path is blocked, creating a loop
    // Must advance left or right
    if (fi !== undefined) {
      if (li !== undefined) {
        if (ri !== undefined) {
          throw new Error("walker unable to advance");
        } else {
          this.#walkTo(right);
        }
      } else if (ri !== undefined) {
        this.#walkTo(left);
      } else {
        if (!this.#isEnclosed(left, fi, [dy, dx])) {
          this.#walkTo(left);
        } else {
          this.#walkTo(right);
        }
      }
      return;
    }

    // Find corner cells' positions and their indeces in the path
    const forwardLeft = [x + dx + dy, y + dy + dx];
    const forwardRight = [x + dx - dy, y + dy - dx];

    const fli = this.indexOf(forwardLeft);
    const fri = this.indexOf(forwardRight);

    // Case 2: Forward left corner is blocked, creating a loop
    // Must advance left if it is not enclosed in the path
    if (fli !== undefined) {
      if (li === undefined && !this.#isEnclosed(left, fli, [dy, dx])) {
        this.#walkTo(left);
        return;
      }
    }

    // Case 3: Forward right corner is blocked, creating a loop
    // Must advance right if it is not enclosed in the path
    if (fri !== undefined) {
      if (ri === undefined && !this.#isEnclosed(right, fri, [-dy, -dx])) {
        this.#walkTo(right);
        return;
      }
    }

    // Case 4: The forward cell is not enclosed in the path
    // The left and right cells are enclosed in the path if their respective corners are occupied
    const options = [forward];
    if (li === undefined && fli === undefined) {
      options.push(left);
    }
    if (ri === undefined && fri === undefined) {
      options.push(right);
    }

    const oi = Math.floor(Math.random() * options.length);
    const next = options[oi];
    this.#walkTo(next);
  }

  advanceBy(n) {
    for (let i = 0; i < n; i++) {
      this.advance();
    }
  }

  advanceTo(length) {
    const n = Math.max(0, length - this.#path.length);
    this.advanceBy(n);
  }

  retreat() {
    if (this.#path.length > 2) {
      const lastCell = this.#path.pop();
      this.#indexMap.delete(lastCell.toString());
    }
  }
}
