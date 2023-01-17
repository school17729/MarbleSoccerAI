class Body {
    /**
     * this.type:
     * 0: Invalid type
     * 1: Player
     * 2: Ball
     */

    constructor() {
        this.bodyId = 0;
        this.type = 0;

        this.position = null;
        this.size = null;
        this.velocity = null;
    }

    initBody(bodyId, type) {
        assert(bodyId, "number");
        assert(type, "number");

        this.bodyId = bodyId;
        this.type = type;
        this.velocity = new Vector2D(0, 0);
    }

    updateBody(bodies) {
        assertObject(bodies, Array);

        this.updatePosition(bodies);
    }

    updatePosition(bodies) {
        assertObject(bodies, Array);

        let bodyCollidedX = false;
        let wallCollidedX = false;
        let velocitySignX = sign(this.velocity.x);
        for (let i = 0; i < Math.abs(this.velocity.x); i += 0.1) {
            this.position.x += 0.1 * velocitySignX;
            if (this.checkBodyCollisions(bodies)) {
                bodyCollidedX = true;
            }
            if (this.checkWallCollisions()) {
                wallCollidedX = true;
            }

            if (bodyCollidedX || wallCollidedX) {
                this.position.x -= 0.1 * velocitySignX;
                break;
            }

        }

        let bodyCollidedY = false;
        let wallCollidedY = false;
        let velocitySignY = sign(this.velocity.y);
        for (let i = 0; i < Math.abs(this.velocity.y); i += 0.1) {
            this.position.y += 0.1 * velocitySignY;
            if (this.checkBodyCollisions(bodies)) {
                bodyCollidedY = true;
            }
            if (this.checkWallCollisions()) {
                wallCollidedY = true;
            }

            if (bodyCollidedY || wallCollidedY) {
                this.position.y -= 0.1 * velocitySignY;
                break;
            }
        }

        if (bodyCollidedX || bodyCollidedY) {
            this.collideWithBodies(bodies);
        }

        if (wallCollidedX || wallCollidedY) {
            this.collideWithWalls();
        }
    }

    checkWallCollisions() {
        for (let i = 0; i < fieldBoundaryLines.length; i += 2) {
            let bodyRectangle = this.getRectangleSelf();
            if (lineToRectangleCollision(fieldBoundaryLines[i], bodyRectangle)) {
                return true;
            }
        }

        for (let i = 1; i < fieldBoundaryLines.length; i += 2) {
            let bodyRectangle = this.getRectangleSelf();
            if (lineToRectangleCollision(fieldBoundaryLines[i], bodyRectangle)) {
                return true;
            }
        }

        return false;
    }

    collideWithWalls() {
        let velocitySignX = sign(this.velocity.x);
        let velocitySignY = sign(this.velocity.y);

        for (let i = 0; i < fieldBoundaryLines.length; i += 2) {
            this.position.y += 0.1 * velocitySignY;
            let bodyRectangle = this.getRectangleSelf();
            if (lineToRectangleCollision(fieldBoundaryLines[i], bodyRectangle)) {
                this.velocity.y *= -1;
                if (this.type === 1) {
                    this.hitWall = true;
                }
            }
            this.position.y -= 0.1 * velocitySignY;
        }

        for (let i = 1; i < fieldBoundaryLines.length; i += 2) {
            this.position.x += 0.1 * velocitySignX;
            let bodyRectangle = this.getRectangleSelf();
            if (lineToRectangleCollision(fieldBoundaryLines[i], bodyRectangle)) {
                this.velocity.x *= -1;
                if (this.type === 1) {
                    this.hitWall = true;
                }
            }
            this.position.x -= 0.1 * velocitySignX;
        }
    }

    checkBodyCollisions(bodies) {
        assertObject(bodies, Array);

        let otherBodies = [];
        for (let i = 0; i < bodies.length; i++) {
            if (bodies[i].bodyId !== this.bodyId) {
                otherBodies.push(bodies[i]);
            }
        }

        for (let i = 0; i < otherBodies.length; i++) {
            let playerCircle = this.getCircleSelf();
            let otherBody = otherBodies[i];
            let otherBodyCircle = otherBody.getCircleSelf();
            if (circleToCircleCollision(playerCircle, otherBodyCircle)) {
                return true;
            }
        }

        return false;
    }

    collideWithBodies(bodies) {
        assertObject(bodies, Array);

        let velocitySignX = sign(this.velocity.x);
        let velocitySignY = sign(this.velocity.y);

        let otherBodies = [];
        for (let i = 0; i < bodies.length; i++) {
            if (bodies[i].bodyId !== this.bodyId) {
                otherBodies.push(bodies[i]);
            }
        }

        for (let i = 0; i < otherBodies.length; i++) {
            this.position.x += 0.1 * velocitySignX;
            this.position.y += 0.1 * velocitySignY;
            let playerCircle = this.getCircleSelf();
            let otherBody = otherBodies[i];
            let otherBodyCircle = otherBody.getCircleSelf();
            if (circleToCircleCollision(playerCircle, otherBodyCircle)) {
                if (this.type === 2) {
                    assert(this.playerHit, "number");
                    assert(otherBody.playerNumber, "number");

                    this.playerHit = otherBody.playerNumber;
                } else if (otherBody.type === 2) {
                    assert(otherBody.playerHit, "number");
                    assert(this.playerNumber, "number");

                    otherBody.playerHit = this.playerNumber;
                }

                let collision = new Vector2D(
                    otherBody.position.x - this.position.x,
                    otherBody.position.y - this.position.y
                );
                let distance = Math.sqrt(
                    Math.pow(collision.x, 2) +
                    Math.pow(collision.y, 2)
                );
                let collisionNormal = new Vector2D(
                    collision.x / distance,
                    collision.y / distance
                );
                let relativeVelocity = new Vector2D(
                    this.velocity.x - otherBody.velocity.x,
                    this.velocity.y - otherBody.velocity.y
                );
                let speed = relativeVelocity.x * collisionNormal.x + relativeVelocity.y * collisionNormal.y;
                if (speed >= 0) {
                    this.velocity.x -= speed * collisionNormal.x;
                    this.velocity.y -= speed * collisionNormal.y;
                    otherBody.velocity.x += speed * collisionNormal.x;
                    otherBody.velocity.y += speed * collisionNormal.y;
                }
            }
            this.position.x -= 0.1 * velocitySignX;
            this.position.y -= 0.1 * velocitySignY;
        }
    }

    getCircleSelf() {
        return new Circle(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, this.size.x / 2);
    }

    getRectangleSelf() {
        return new Rectangle(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}

class Ball extends Body {
    constructor() {
        super();
        this.ballImage = null;
        this.playerHit = 0;
    }

    init(bodyId, team1, team2) {
        assert(bodyId, "number");
        assert(team1, "number");
        assert(team2, "number");

        this.initBody(bodyId, 2);
        this.ballImage = ballImage;
        this.position = ballStartPosition.clone();
        this.size = ballSize.clone();

        this.team1 = team1;
        this.team2 = team2;
    }

    update(bodies) {
        assertObject(bodies, Array);

        this.updateBody(bodies);
    }

    checkGoalScored() {
        return this.checkGoalCollision();
    }

    draw() {
        image(this.ballImage, this.position.x, this.position.y, this.size.x, this.size.y);
    }

    checkGoalCollision() {
        let bodyRectangle = this.getRectangleSelf();
        if (lineToRectangleCollision(team1GoalLine, bodyRectangle)) {
            return this.team2;
        }
        if (lineToRectangleCollision(team2GoalLine, bodyRectangle)) {
            return this.team1;
        }

        return 0;
    }

    saveBodyCollision(bodies) {
        assertObject(bodies, Array);

        let otherBodies = [];
        for (let i = 0; i < bodies.length; i++) {
            if (bodies[i].bodyId !== this.bodyId) {
                otherBodies.push(bodies[i]);
            }
        }

        for (let i = 0; i < otherBodies.length; i++) {
            let playerCircle = this.getCircleSelf();
            let otherBody = otherBodies[i];
            let otherBodyCircle = otherBody.getCircleSelf();
            if (circleToCircleCollision(playerCircle, otherBodyCircle)) {
                assert(this.playerHit, "number");
                assert(otherBody.playerNumber, "number");

                this.playerHit = otherBody.playerNumber;
            }
        }
    }
}

class Player extends Body {
    constructor() {
        super();
        this.country = 0;
        this.countryImage = null;
        this.playerNumber = 0;

        this.hitWall = false;
        this.blockedGoal = false;

        this.team1 = 0;
        this.team2 = 0;
        this.neuralNetwork = null;
    }

    init(country, playerNumber, bodyId, team1, team2) {
        assert(country, "number");
        assert(playerNumber, "number");
        assert(bodyId, "number");
        assert(team1, "number");
        assert(team2, "number");

        this.initBody(bodyId, 1);

        this.country = country;
        this.countryImage = countryImages[this.country];
        this.playerNumber = playerNumber;
        this.position = playerStartPositions[this.playerNumber].clone();
        this.size = playerSize.clone();

        this.team1 = team1;
        this.team2 = team2;
        // startingFitness parameter is set to gamesBeforeSelection * 3 because
        // the maximum number of fitness points a network can lose each game is 2, and
        // there is <gamesBeforeSelection> games before selection occurs
        this.neuralNetwork = new NeuralNetwork(8, 6, 4, 1);
    }

    update(bodies, ball) {
        assertObject(bodies, Array);
        assertObject(ball, Ball);

        this.applyFriction();
        this.checkGoalCollision();
        this.updateAIAction(ball);
        this.updateBody(bodies);
    }

    draw() {
        let correctedPositionX = this.position.x - ((this.size.x * (countryImageCorrections[this.country] - 1)) / 2);
        let correctedPositionY = this.position.y - ((this.size.y * (countryImageCorrections[this.country] - 1)) / 2);
        let correctedSizeX = this.size.x * countryImageCorrections[this.country];
        let correctedSizeY = this.size.y * countryImageCorrections[this.country];
        // image(this.countryImage, correctedPositionX, correctedPositionY, correctedSizeX, correctedSizeY);


        // stroke(255, 0, 0);
        // rect(this.position.x, this.position.y, this.size.x, this.size.y);
        // stroke(0, 255, 0);
        // rect(correctedPositionX, correctedPositionY, correctedSizeX, correctedSizeY);
        noFill();
        let circleSelf = this.getCircleSelf();
        let strokeColor = countrySketchColors[this.country];
        strokeWeight(10);
        stroke(strokeColor.r, strokeColor.g, strokeColor.b);
        ellipse(circleSelf.x, circleSelf.y, circleSelf.radius * 2, circleSelf.radius * 2);
    }

    applyFriction() {
        this.velocity.x *= playerFriction;
        this.velocity.y *= playerFriction;
    }

    checkGoalCollision() {
        let bodyRectangle = this.getRectangleSelf();
        if (lineToRectangleCollision(team1GoalLine, bodyRectangle)) {
            this.blockedGoal = true;
        }
        if (lineToRectangleCollision(team2GoalLine, bodyRectangle)) {
            this.blockedGoal = true;
        }

        return 0;
    }

    updateAIAction(ball) {
        assertObject(ball, Ball);

        let team1Value = 0;
        if (this.country === this.team1) {
            team1Value = 1;
        } else {
            team1Value = 0;
        }
        let team2Value = 0;
        if (this.country === this.team2) {
            team2Value = 1;
        } else {
            team2Value = 0;
        }

        let inputArray = [];
        if (this.country === this.team1) {
            inputArray = [
                mapValue(this.position.x, 0, 1920, -1, 1),
                mapValue(this.position.y, 0, 1920, -1, 1),
                mapValue(this.velocity.x, -10, 10, -1, 1),
                mapValue(this.velocity.y, -10, 10, -1, 1),
                mapValue(ball.position.x, 0, 1920, -1, 1),
                mapValue(ball.position.y, 0, 1920, -1, 1),
                mapValue(ball.velocity.x, -10, 10, -1, 1),
                mapValue(ball.velocity.y, -10, 10, -1, 1)
            ];
        } else {
            inputArray = [
                mapValue(this.position.x, 0, 1920, 1, -1),
                mapValue(this.position.y, 0, 1920, -1, 1),
                mapValue(this.velocity.x, -10, 10, 1, -1),
                mapValue(this.velocity.y, -10, 10, -1, 1),
                mapValue(ball.position.x, 0, 1920, 1, -1),
                mapValue(ball.position.y, 0, 1920, -1, 1),
                mapValue(ball.velocity.x, -10, 10, 1, -1),
                mapValue(ball.velocity.y, -10, 10, -1, 1)
            ];
        }


        let outputs = this.neuralNetwork.feedforward(inputArray);

        let accelerationXSign = 0;
        if (outputs[0] > outputs[1]) {
            accelerationXSign = -1;
        } else {
            accelerationXSign = 1;
        }

        let accelerationYSign = 0;
        if (outputs[2] > outputs[3]) {
            accelerationYSign = -1;
        } else {
            accelerationYSign = 1;
        }

        if (this.country === this.team2) {
            accelerationXSign *= -1;
        }

        this.velocity.x += accelerationXSign * playerAcceleration;
        this.velocity.y += accelerationYSign * playerAcceleration;
    }
}