class Vector2D {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vector2D(this.x, this.y);
    }
}

class Line {

    constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
    }

    clone() {
        return new Line(this.startX, this.startY, this.endX, this.endY);
    }
}

class Rectangle {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    getLeftLine() {
        return new Line(this.x, this.y, this.x, this.y + this.height);
    }

    getRightLine() {
        return new Line(this.x + this.width, this.y, this.x + this.width, this.y + this.height);
    }

    getTopLine() {
        return new Line(this.x, this.y, this.x + this.width, this.y);
    }

    getBottomLine() {
        return new Line(this.x, this.y + this.height, this.x + this.width, this.y + this.height);
    }

    clone() {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }
}

class Circle {

    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    clone() {
        return new Circle(this.x, this.y, this.radius);
    }
}

function lineToRectangleCollision(line, rectangle) {
    let left =   lineToLineCollision(line, rectangle.getLeftLine());
    let right =  lineToLineCollision(line, rectangle.getRightLine());
    let top =    lineToLineCollision(line, rectangle.getTopLine());
    let bottom = lineToLineCollision(line, rectangle.getBottomLine());

    return left || right || top || bottom;
}

function lineToLineCollision(line1, line2) {
    // taken from https://www.jeffreythompson.org/collision-detection/line-line.php
    // explanation at https://web.archive.org/web/20060911055655/http://local.wasp.uwa.edu.au/~pbourke/geometry/lineline2d/

    let unionANumerator = ((line2.endX-line2.startX) * (line1.startY-line2.startY) - (line2.endY-line2.startY) * (line1.startX-line2.startX));
    let unionADenominator = ((line2.endY-line2.startY) * (line1.endX-line1.startX) - (line2.endX-line2.startX) * (line1.endY-line1.startY));
    let unionBNumerator = ((line1.endX-line1.startX) * (line1.startY-line2.startY) - (line1.endY-line1.startY) * (line1.startX-line2.startX));
    let unionBDenominator = ((line2.endY-line2.startY) * (line1.endX-line1.startX) - (line2.endX-line2.startX) * (line1.endY-line1.startY));

    let unionA = unionANumerator / unionADenominator;
    let unionB = unionBNumerator / unionBDenominator;
    return unionA >= 0 && unionA <= 1 && unionB >= 0 && unionB <= 1;
}

function circleToCircleCollision(circle1, circle2) {
    let distanceX = circle2.x - circle1.x;
    let distanceY = circle2.y - circle1.y;
    let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    return distance <= circle1.radius + circle2.radius;
}

class Color {
    constructor(r, g, b) {
        assert(r, "number");
        assert(g, "number");
        assert(b, "number");

        this.r = r;
        this.g = g;
        this.b = b;
    }

    clone() {
        return new Color(this.r, this.g, this.b);
    }
}

class Matrix {
    constructor(rowCount, columnCount) {
        assert(rowCount, "number");
        assert(columnCount, "number");

        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.matrix = [];
        for (let i = 0; i < this.rowCount * this.columnCount; i++) {
            this.matrix.push(0);
        }
    }

    setMatrixArray(matrixArray) {
        assertObject(matrixArray, Array);
        if (matrixArray.length !== this.rowCount * this.columnCount) {
            throw new Error();
        }

        for (let i = 0; i < matrixArray.length; i++) {
            this.matrix[i] = matrixArray[i];
        }
    }

    getMatrixArray() {
        let newMatrixArray = [];
        for (let i = 0; i < this.matrix.length; i++) {
            newMatrixArray.push(this.matrix[i]);
        }
        return newMatrixArray;
    }

    setRandomMatrix() {
        for (let i = 0; i < this.matrix.length; i++) {
            this.matrix[i] = Math.random() * 2 - 1;
        }
    }

    equals(matrix) {
        assertObject(matrix, Matrix);
        if (matrix.rowCount !== this.rowCount || matrix.columnCount !== this.columnCount) {
            return false;
        }
        for (let i = 0; i < this.matrix.length; i++) {
            if (this.matrix[i] !== matrix.matrix[i]) {
                return false;
            }
        }
        return true;
    }

    map(func) {
        assertObject(func, Function);

        let newMatrix = new Matrix(this.rowCount, this.columnCount);
        let newMatrixArray = [];
        for (let i = 0; i < this.matrix.length; i++) {
            newMatrixArray.push(func(this.matrix[i]));
        }
        newMatrix.setMatrixArray(newMatrixArray);

        return newMatrix;
    }

    clone() {
        let newMatrix = new Matrix(this.rowCount, this.columnCount);
        let newMatrixArray = [];
        for (let i = 0; i < this.matrix.length; i++) {
            newMatrixArray.push(this.matrix[i]);
        }
        newMatrix.setMatrixArray(newMatrixArray);

        return newMatrix;
    }

    negate() {
        let newMatrix = new Matrix(this.rowCount, this.columnCount);
        let newMatrixArray = [];
        for (let i = 0; i < this.matrix.length; i++) {
            newMatrixArray.push(this.matrix[i] * -1);
        }
        newMatrix.setMatrixArray(newMatrixArray);

        return newMatrix;
    }

    addMatrix(matrix) {
        assertObject(matrix, Matrix);
        if (matrix.rowCount !== this.rowCount || matrix.columnCount !== this.columnCount) {
            throw new Error();
        }

        let newMatrix = new Matrix(this.rowCount, this.columnCount);
        let newMatrixArray = [];
        for (let i = 0; i < this.matrix.length; i++) {
            newMatrixArray.push(this.matrix[i] + matrix.matrix[i]);
        }
        newMatrix.setMatrixArray(newMatrixArray);

        return newMatrix;
    }

    multiplyConstant(value) {
        assert(value, "number");

        let newMatrix = new Matrix(this.rowCount, this.columnCount);
        let newMatrixArray = [];
        for (let i = 0; i < this.matrix.length; i++) {
            newMatrixArray.push(this.matrix[i] * value);
        }
        newMatrix.setMatrixArray(newMatrixArray);

        return newMatrix;
    }

    multiplyMatrix(matrix) {
        assertObject(matrix, Matrix);
        if (matrix.rowCount !== this.columnCount) {
            throw new Error();
        }

        let newMatrix = new Matrix(this.rowCount, matrix.columnCount);
        let newMatrixArray = [];
        for (let i = 0; i < this.rowCount; i++) {
            for (let j = 0; j < matrix.columnCount; j++) {
                let sum = 0;
                let l = this.columnCount * i;
                let m = j;
                for (let k = 0; k < this.columnCount; k++) {
                    sum += this.matrix[l] * matrix.matrix[m];
                    l += 1;
                    m += matrix.columnCount;
                }
                newMatrixArray.push(sum);
            }
        }
        newMatrix.setMatrixArray(newMatrixArray);

        return newMatrix;
    }
}

function sigmoid(value) {
    return 1 / (1 + Math.exp(-value));
}

function sign(value) {
    assert(value, "number");

    if (value > 0) {
        return 1;
    } else {
        return -1;
    }
}

function mapValue(value, inputMinimum, inputMaximum, outputMinimum, outputMaximum) {
    return ((value - inputMinimum) * (outputMaximum - outputMinimum)) / (inputMaximum - inputMinimum) + outputMinimum;
}

function shuffleArray(array) {
    assertObject (array, Array);

    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        newArray.push(array[i]);
    }

    let currentIndex = newArray.length;
    let randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [
            newArray[currentIndex],
            newArray[randomIndex]
        ] = [
            newArray[randomIndex],
            newArray[currentIndex]
        ];
    }

    return newArray;
}

function assert(variable, type) {
    if (typeof variable !== type) {
        throw new Error(typeof variable + " " + variable + " is not a " + type);
    }
}

function assertObject(object, type) {
    if (!(object instanceof type)) {
        throw new Error();
    }
}
