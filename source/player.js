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
        if (regularNetworks) {
            this.neuralNetwork = new NeuralNetwork([4, 3, 3, 2], startingFitness);
        } else {
            this.neuralNetwork = new NeuralNetwork([8, 6, 6, 4], startingFitness);
        }

    }

    update(bodies, ball) {
        assertObject(bodies, Array);
        assertObject(ball, Ball);

        this.applyFriction();
        this.updateAIAction(ball);
        this.updateBody(bodies);
    }

    draw() {
        // let correctedPositionX = this.position.x - ((this.size.x * (countryImageCorrections[this.country] - 1)) / 2);
        // let correctedPositionY = this.position.y - ((this.size.y * (countryImageCorrections[this.country] - 1)) / 2);
        // let correctedSizeX = this.size.x * countryImageCorrections[this.country];
        // let correctedSizeY = this.size.y * countryImageCorrections[this.country];
        // image(this.countryImage, correctedPositionX, correctedPositionY, correctedSizeX, correctedSizeY);
        // stroke(255, 0, 0);
        // rect(this.position.x, this.position.y, this.size.x, this.size.y);
        // stroke(0, 255, 0);
        // rect(correctedPositionX, correctedPositionY, correctedSizeX, correctedSizeY);


        let circleSelf = this.getCircleSelf();
        let strokeColor = countrySketchColors[this.country];

        noFill();
        strokeWeight(5);
        stroke(strokeColor.r, strokeColor.g, strokeColor.b);
        ellipse(circleSelf.x, circleSelf.y, circleSelf.radius * 2, circleSelf.radius * 2);

        strokeWeight(3);
        stroke(0);
        fill(255);
        textSize(32);
        text(this.playerNumber, circleSelf.x, circleSelf.y);
    }

    reset(bodies) {
        assertObject(bodies, Array);

        this.position = new Vector2D(Math.random() * 1680 + 85, Math.random() * 850 + 25);
        while (this.checkBodyCollisions(bodies)) {
            this.position = new Vector2D(Math.random() * 1680 + 85, Math.random() * 850 + 25);
        }

        this.velocity = new Vector2D(Math.random() * 18 - 9, Math.random() * 18 - 9);
    }

    applyFriction() {
        this.velocity.x *= playerFriction;
        this.velocity.y *= playerFriction;
    }

    updateAIAction(ball) {
        assertObject(ball, Ball);

        let inputArray = [];

        if (regularNetworks) {
            if (this.country === this.team1) {
                inputArray = [
                    mapValue(this.position.x, 0, 1920, -1, 1),
                    mapValue(this.position.y, 0, 969, -1, 1),
                    mapValue(ball.position.x, 0, 1920, -1, 1),
                    mapValue(ball.position.y, 0, 969, -1, 1),
                ];
            } else {
                inputArray = [
                    mapValue(this.position.x, 0, 1920, 1, -1),
                    mapValue(this.position.y, 0, 969, -1, 1),
                    mapValue(ball.position.x, 0, 1920, 1, -1),
                    mapValue(ball.position.y, 0, 969, -1, 1),
                ];
            }
        } else {
            if (this.country === this.team1) {
                inputArray = [
                    mapValue(this.position.x, 0, 1920, -1, 1),
                    mapValue(this.position.y, 0, 969, -1, 1),
                    mapValue(this.velocity.x, -10, 10, -1, 1),
                    mapValue(this.velocity.y, -10, 10, -1, 1),
                    mapValue(ball.position.x, 0, 1920, -1, 1),
                    mapValue(ball.position.y, 0, 969, -1, 1),
                    mapValue(ball.velocity.x, -10, 10, -1, 1),
                    mapValue(ball.velocity.y, -10, 10, -1, 1)
                ];
            } else {
                inputArray = [
                    mapValue(this.position.x, 0, 1920, 1, -1),
                    mapValue(this.position.y, 0, 969, -1, 1),
                    mapValue(this.velocity.x, -10, 10, 1, -1),
                    mapValue(this.velocity.y, -10, 10, -1, 1),
                    mapValue(ball.position.x, 0, 1920, 1, -1),
                    mapValue(ball.position.y, 0, 969, -1, 1),
                    mapValue(ball.velocity.x, -10, 10, 1, -1),
                    mapValue(ball.velocity.y, -10, 10, -1, 1)
                ];
            }
        }


        let outputs = this.neuralNetwork.feedforward(inputArray);

        let accelerationXSign = 0;
        let accelerationYSign = 0;
        if (regularNetworks) {
            if (outputs[0] < 0.5) {
                accelerationXSign = -1;
            } else {
                accelerationXSign = 1;
            }


            if (outputs[1] < 0.5) {
                accelerationYSign = -1;
            } else {
                accelerationYSign = 1;
            }
        } else {
            if (outputs[0] > outputs[1]) {
                accelerationXSign = -1;
            } else {
                accelerationXSign = 1;
            }


            if (outputs[2] > outputs[3]) {
                accelerationYSign = -1;
            } else {
                accelerationYSign = 1;
            }
        }


        if (this.country === this.team2) {
            accelerationXSign *= -1;
        }

        this.velocity.x += accelerationXSign * playerAcceleration;
        this.velocity.y += accelerationYSign * playerAcceleration;
    }
}