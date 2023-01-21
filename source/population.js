class Population {
    constructor() {
        this.games = [];

        this.fitnessSum = 0;
        this.neuralNetworks = [];
        this.championNetwork = null;
    }

    init() {
        let separatedTeams = this.getSeparatedTeams();

        for (let i = 0; i < separatedTeams.length; i++) {
            this.games.push(new Game());
            this.games[i].init(separatedTeams[i][0], separatedTeams[i][1]);
        }
    }

    update() {
        for (let i = 0; i < this.games.length; i++) {
            this.games[i].update();
        }

        let readyForSelection = true;
        for (let i = 0; i < this.games.length; i++) {
            if (!this.games[i].checkReadyForSelection()) {
                readyForSelection = false;
            }
        }

        if (readyForSelection) {
            this.updateNeuralNetworks();
            this.standardizeFitness();
            this.getChampion();
            this.sumFitness();
            this.naturalSelection();
            this.addChampion();
            this.resetFitness();
            this.createGames();
            this.setEvolutionVariables();
        }
    }

    getSeparatedTeams() {
        let shuffledTeams = shuffleArray(teamsPlaying);

        let separatedTeams = [];
        for (let i = 0; i < shuffledTeams.length / 2; i++) {
            let separatedTeam = [];
            for (let j = 0; j < 2; j++) {
                separatedTeam.push(shuffledTeams[i * 2 + j]);
            }
            separatedTeams.push(separatedTeam);
        }

        return separatedTeams;
    }

    updateNeuralNetworks() {
        this.neuralNetworks = [];

        for (let i = 0; i < this.games.length; i++) {
            let gameNeuralNetworks = this.games[i].getNeuralNetworks();
            for (let j = 0; j < gameNeuralNetworks.length; j++) {
                this.neuralNetworks.push(gameNeuralNetworks[j]);
            }
        }
    }

    standardizeFitness() {
        let smallestFitness = Number.MAX_VALUE;
        let largestFitness = 0;
        for (let i = 0; i < this.neuralNetworks.length; i++) {
            if (smallestFitness > this.neuralNetworks[i].fitness) {
                smallestFitness = this.neuralNetworks[i].fitness;
            }

            if (this.neuralNetworks[i].fitness > largestFitness) {
                largestFitness = this.neuralNetworks[i].fitness;
            }
        }
        console.log("generation: ", generation);
        console.log("smallestFitness: ", smallestFitness);
        console.log("largestFitness: ", largestFitness);
        for (let i = 0; i < this.neuralNetworks.length; i++) {
            this.neuralNetworks[i].fitness -= (smallestFitness - 1);
        }
    }

    getChampion() {
        this.championNetwork = null;

        let largestFitness = 0;
        let championNetwork = null;
        for (let i = 0; i < this.neuralNetworks.length; i++) {
            if (this.neuralNetworks[i].fitness > largestFitness) {
                largestFitness = this.neuralNetworks[i].fitness;
                championNetwork = this.neuralNetworks[i];
            }
        }

        this.championNetwork = championNetwork;
    }

    sumFitness() {
        this.fitnessSum = 0;
        for (let i = 0; i < this.neuralNetworks.length; i++) {
            this.fitnessSum += this.neuralNetworks[i].fitness;
        }
    }

    draw() {
        this.games[0].draw();
        // for (let i = 0; i < this.games.length; i++) {
        //
        // }
    }

    naturalSelection() {
        let newNeuralNetworks = [];
        // the second statement is i < this.neuralNetworks.length - 1 because we are keeping the champion safe
        for (let i = 0; i < this.neuralNetworks.length - 1; i++) {
            newNeuralNetworks.push(this.chooseSurvivor());
        }
        this.neuralNetworks = newNeuralNetworks;
    }

    chooseSurvivor() {
        let chooseRank = Math.random() * this.fitnessSum;
        let runningSum = 0;
        for (let i = 0; i < this.neuralNetworks.length; i++) {
            runningSum += this.neuralNetworks[i].fitness;
            if (runningSum > chooseRank) {
                return this.neuralNetworks[i].clone();
            }
        }

        return null;
    }

    mutate() {
        for (let i = 0; i < this.neuralNetworks.length; i++) {
            this.neuralNetworks[i].mutate(mutationRate);
        }
    }

    addChampion() {
        this.neuralNetworks.push(this.championNetwork);
    }

    resetFitness() {
        for (let i = 0; i < this.neuralNetworks.length; i++) {
            this.neuralNetworks[i].fitness = 1;
        }
    }

    createGames() {
        this.games = [];

        let separatedTeams = this.getSeparatedTeams();

        let neuralNetworkTeamPlayers = [];
        for (let i = 0; i < separatedTeams.length * 2; i++) {
            let teamPlayers = [];
            for (let j = 0; j < 11; j++) {
                teamPlayers.push(this.neuralNetworks[i * 11 + j]);
            }
            neuralNetworkTeamPlayers.push(teamPlayers);
        }

        console.log("neuralNetworkTeamPlayers: ", neuralNetworkTeamPlayers);

        for (let i = 0; i < separatedTeams.length; i++) {
            let team1 = separatedTeams[i][0];
            let team2 = separatedTeams[i][1];
            this.games.push(new Game());
            this.games[i].init(team1, team2);
            this.games[i].setTeamNetworks(neuralNetworkTeamPlayers[team1 - 1], neuralNetworkTeamPlayers[team2 - 1]);
        }
    }

    setEvolutionVariables() {
        generation++;
    }
}