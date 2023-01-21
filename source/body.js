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

    draw() {
        image(this.ballImage, this.position.x, this.position.y, this.size.x, this.size.y);
    }

    reset(bodies) {
        assertObject(bodies, Array);

        this.position = new Vector2D(Math.random() * 1710 + 85, Math.random() * 880 + 25);
        while (this.checkBodyCollisions(bodies)) {
            this.position = new Vector2D(Math.random() * 1710 + 85, Math.random() * 880 + 25);
        }

        this.velocity = new Vector2D(Math.random() * 18 - 9, Math.random() * 18 - 9);
    }

    checkGoalScored() {
        return this.checkGoalCollision();
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
