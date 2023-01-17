class NeuralNetwork {
    constructor(inputCount, hiddenCount, outputCount, startingFitness) {
        assert(inputCount, "number");
        assert(hiddenCount, "number");
        assert(outputCount, "number");
        assert(startingFitness, "number");

        this.inputCount = inputCount;
        this.hiddenCount = hiddenCount;
        this.outputCount = outputCount;

        this.weightsInputHidden = new Matrix(this.hiddenCount, this.inputCount);
        this.weightsHiddenOutput = new Matrix(this.outputCount, this.hiddenCount);
        this.weightsInputHidden.setRandomMatrix();
        this.weightsHiddenOutput.setRandomMatrix();

        this.hiddenBias = new Matrix(this.hiddenCount, 1);
        this.outputBias = new Matrix(this.outputCount, 1);
        this.hiddenBias.setRandomMatrix();
        this.outputBias.setRandomMatrix();

        this.fitness = startingFitness;
    }

    feedforward(inputArray) {
        assertObject(inputArray, Array);

        let inputs = new Matrix(this.inputCount, 1);
        inputs.setMatrixArray(inputArray);

        let hidden = this.weightsInputHidden.multiplyMatrix(inputs);
        hidden.addMatrix(this.hiddenBias);
        hidden.map(sigmoid);

        let output = this.weightsHiddenOutput.multiplyMatrix(hidden);
        output.addMatrix(this.outputBias);
        output.map(sigmoid);

        return output.getMatrixArray();
    }

    clone() {
        let newNeuralNetwork = new NeuralNetwork(this.inputCount, this.hiddenCount, this.outputCount, gamesBeforeSelection * 2);
        newNeuralNetwork.weightsInputHidden = this.weightsInputHidden.clone();
        newNeuralNetwork.weightsHiddenOutput = this.weightsHiddenOutput.clone();
        newNeuralNetwork.hiddenBias = this.hiddenBias.clone();
        newNeuralNetwork.outputBias = this.outputBias.clone();
        newNeuralNetwork.fitness = this.fitness;

        return newNeuralNetwork;
    }

    mutate(rate) {
        function mutateValue(value) {
            if (Math.random() < rate) {
                return Math.random() * 2 - 1;
            } else {
                return value;
            }
        }

        this.weightsInputHidden.map(mutateValue);
        this.weightsHiddenOutput.map(mutateValue);
        this.hiddenBias.map(mutateValue);
        this.outputBias.map(mutateValue)
    }

}