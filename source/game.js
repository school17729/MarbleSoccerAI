class Game {
    constructor() {
        this.players = [];
        this.ball = null;
        this.bodies = [];

        this.team1 = 0;
        this.team2 = 0;
        this.gameTimer = 0;
        this.gamesPassed = 0;
        this.readyForSelection = false;
    }

    init(team1, team2) {
        assert(team1, "number");
        assert(team2, "number");

        this.team1 = team1;
        this.team2 = team2;

        for (let i = 0; i < playersOnTeam * 2; i++) {
            this.players.push(new Player());
        }

        let bodyId = 1;
        for (let i = 0; i < playersOnTeam; i++) {
            this.players[i].init(this.team1, i + 1, bodyId, this.team1, this.team2);
            bodyId++;
        }
        for (let i = playersOnTeam; i < playersOnTeam * 2; i++) {
            this.players[i].init(this.team2, i + 1, bodyId, this.team1, this.team2);
            bodyId++;
        }

        this.ball = new Ball();
        this.ball.init(bodyId, this.team1, this.team2);
        bodyId++;

        for (let i = 0; i < this.players.length; i++) {
            this.bodies.push(this.players[i]);
        }
        this.bodies.push(this.ball);
    }

    setTeamNetworks(team1Networks, team2Networks) {
        assertObject(team1Networks, Array);
        assertObject(team2Networks, Array);

        for (let i = 0; i < 11; i++) {
            this.players[i].neuralNetwork = team1Networks[i];
        }
        for (let i = 11; i < 22; i++) {
            this.players[i].neuralNetwork = team2Networks[i - 11];
        }
    }

    update() {
        if (this.gamesPassed >= gamesBeforeSelection) {
            this.readyForSelection = true;
        } else {
            for (let i = 0; i < this.players.length; i++) {
                this.players[i].update(this.bodies, this.ball);
            }
            this.ball.update(this.bodies);

            this.gameTimer++;
            if (this.gameTimer > gameTimeout) {
                this.reset();
            }

            let teamOfGoal = this.ball.checkGoalScored();
            if (teamOfGoal !== 0) {
                this.goalScored(teamOfGoal, this.ball.playerHit);
                this.reset();
            }
        }
    }

    checkReadyForSelection() {
        return this.readyForSelection;
    }

    getNeuralNetworks() {
        let neuralNetworks = [];

        for (let i = 0; i < this.players.length; i++) {
            neuralNetworks.push(this.players[i].neuralNetwork);
        }

        return neuralNetworks;
    }

    draw() {
        if (this.readyForSelection) {
            strokeWeight(3);
            stroke(255, 0, 0);
            fill(0);
            textSize(32);
            text("Waiting for natural selection...", 40, 120);
        }

        for (let i = 0; i < this.players.length; i++) {
            this.players[i].draw();
        }
        this.ball.draw();
    }

    reset() {
        let neuralNetworks = [];
        for (let i = 0; i < this.players.length; i++) {
            neuralNetworks.push(this.players[i].neuralNetwork);
        }

        for (let i = 0; i < this.players.length; i++) {
            if (!this.players[i].blockedGoal) {
                neuralNetworks[i].fitness += 6;
            }
        }

        let shuffledNeuralNetworks = shuffleArray(neuralNetworks);

        this.players = [];
        this.ball = null;
        this.bodies = [];

        for (let i = 0; i < playersOnTeam * 2; i++) {
            this.players.push(new Player());
        }

        let bodyId = 1;
        for (let i = 0; i < playersOnTeam; i++) {
            this.players[i].init(this.team1, i + 1, bodyId, this.team1, this.team2);
            bodyId++;
        }
        for (let i = playersOnTeam; i < playersOnTeam * 2; i++) {
            this.players[i].init(this.team2, i + 1, bodyId, this.team1, this.team2);
            bodyId++;
        }

        this.ball = new Ball();
        this.ball.init(bodyId, this.team1, this.team2);
        bodyId++;

        for (let i = 0; i < this.players.length; i++) {
            this.bodies.push(this.players[i]);
        }
        this.bodies.push(this.ball);

        for (let i = 0; i < this.players.length; i++) {
            this.players[i].neuralNetwork = shuffledNeuralNetworks[i];
        }

        this.gameTimer = 0;
        this.gamesPassed++;
        totalGamesPlayed++;
    }

    goalScored(teamOfGoal, playerOfGoal) {
        assert(teamOfGoal, "number");
        assert(playerOfGoal, "number");

        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].country === teamOfGoal) {
                this.players[i].neuralNetwork.fitness++;
            } else {
                // this.players[i].neuralNetwork.fitness--;
            }

            if (this.players[i].playerNumber === playerOfGoal) {
                if (this.players[i].country === teamOfGoal) {
                    this.players[i].neuralNetwork.fitness += 24;
                } else {
                    // this.players[i].neuralNetwork.fitness--;
                }
            }
        }
    }
}