class NeuralNetwork {
    constructor(layerCountArray, startingFitness) {
        assertObject(layerCountArray, Array);
        assert(startingFitness, "number");

        this.layerCountArray = layerCountArray;

        this.layerWeights = [];
        for (let i = 1; i < this.layerCountArray.length; i++) {
            let matrix = new Matrix(this.layerCountArray[i], this.layerCountArray[i - 1]);
            matrix.setRandomMatrix();
            this.layerWeights.push(matrix);
        }

        this.layerBiases = [];
        for (let i = 1; i < this.layerCountArray.length; i++) {
            let matrix = new Matrix(this.layerCountArray[i], 1);
            matrix.setRandomMatrix();
            this.layerBiases.push(matrix);
        }

        this.fitness = startingFitness;
    }

    feedforward(inputArray) {
        assertObject(inputArray, Array);

        let inputs = new Matrix(this.layerCountArray[0], 1);
        inputs.setMatrixArray(inputArray);

        for (let i = 0; i < this.layerWeights.length; i++) {
            let newInputs = this.layerWeights[i].multiplyMatrix(inputs);
            newInputs = newInputs.addMatrix(this.layerBiases[i]);
            newInputs = newInputs.map(sigmoid);
            inputs = newInputs;
        }

        return inputs.getMatrixArray();
    }

    clone() {
        let newNeuralNetwork = new NeuralNetwork(this.layerCountArray, startingFitness);

        let newLayerWeights = [];
        for (let i = 0; i < this.layerWeights.length; i++) {
            newLayerWeights.push(this.layerWeights[i].clone());
        }
        newNeuralNetwork.layerWeights = newLayerWeights;

        let newLayerBiases = [];
        for (let i = 0; i < this.layerBiases.length; i++) {
            newLayerBiases.push(this.layerBiases[i].clone());
        }
        newNeuralNetwork.layerBiases = newLayerBiases;
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

        for (let i = 0; i < this.layerWeights.length; i++) {
            this.layerWeights[i] = this.layerWeights[i].map(mutateValue);
        }

        for (let i = 0; i < this.layerBiases.length; i++) {
            this.layerBiases[i] = this.layerBiases[i].map(mutateValue);
        }
    }
}