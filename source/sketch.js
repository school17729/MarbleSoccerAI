let canvasWidth = 1920;
let canvasHeight = 969;

let fieldImage = null;
let ballImage = null;
let countryImages = [null];
let countrySketchColors = [null];
let countryImageCorrections = [0, 1.3, 1.4]; //TODO: Complete image corrections
let flagImages = [null];

let population = null;
let players = [];
let balls = [];

let fieldBoundaryLines = [];
let team1GoalLine = null;
let team2GoalLine = null;

let gamesBeforeSelection = 6;
let gameTimeout = 600;
let teamCount = 30;
let teamsPlaying = [];
for (let i = 0; i < teamCount; i++) {
    teamsPlaying.push(i + 1);
}


let playersOnTeam = 11;
let playerStartPositions = [];
let playerSize = [];
let playerAcceleration = 1;
let playerFriction = 0.9;
let playerCoefficientOfRestitution = 1;

let ballStartPosition = null;
let ballSize = null;
let ballCoefficientOfRestitution = 1;

let generation = 1;
let totalGamesPlayed = 0;
let mutationRate = 0.1;

/**
 * team map:
 * 0: invalid team
 * 1: United States
 * 2: Soviet Union
 * 3: United Kingdom
 * 4: Germany
 */

function preload() {
    loadImages();
}

function setup() {
    setupDocument();
    setupCanvas();
    setupConstants();

    population = new Population();
    population.init();
}

function draw() {
    background(0);
    image(fieldImage, 0, 0, canvasWidth, canvasHeight);
    strokeWeight(5);
    stroke(0, 0, 255);
    line(team1GoalLine.startX, team1GoalLine.startY, team1GoalLine.endX, team1GoalLine.endY);
    strokeWeight(5);
    stroke(0, 255, 0);
    line(team2GoalLine.startX, team2GoalLine.startY, team2GoalLine.endX, team2GoalLine.endY);

    population.update();
    population.draw();

    strokeWeight(3);
    stroke(255, 0, 0);
    fill(0);
    textSize(32);
    let textY = 40;
    text("Generation: " + generation, 40, textY);
    textY += 40;
    text("Total games played: " + totalGamesPlayed, 40, textY);
    textY += 40;
    // for (let i = 0; i < population.games.length; i++) {
    //     text("Game: " + population.games[i].gamesPassed, 40, textY);
    //     textY += 40;
    //     text(population.games[i].gameTimer, 40, textY);
    //     textY += 40;
    // }
}

function loadImages() {
    fieldImage = loadImage("./resources/field.png");
    ballImage = loadImage("./resources/ball.png");
    countryImages.push(loadImage("./resources/unitedStates.png"));
    countryImages.push(loadImage("./resources/unitedKingdom.png"));

    flagImages.push(loadImage("./resources/unitedStatesFlag.png"));
    flagImages.push(loadImage("./resources/unitedKingdomFlag.png"));
}

function setupDocument() {
    let html = document.body.parentElement;
    let body = document.body;
    html.style.padding = "0px";
    html.style.margin = "0px";
    body.style.padding = "0px";
    body.style.margin = "0px";
}

function setupCanvas() {
    createCanvas(1920, 969);
    let canvases = document.getElementsByTagName("canvas");
    for (let i = 0; i < canvases.length; i++) {
        canvases[i].style.display = "block";
    }
}

function setupConstants() {
    countrySketchColors = [null];
    for (let i = 0; i < teamCount; i++) {
        countrySketchColors.push(new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255));
    }



    fieldBoundaryLines = [
        new Line(85, 25, 1835, 25),
        new Line(1835, 25, 1835, 945),
        new Line(1835, 945, 85, 945),
        new Line(85, 945, 85, 25)
    ];

    team1GoalLine = new Line(90, 25, 90, 945);
    team2GoalLine = new Line(1830, 25, 1830, 9450);

    playerStartPositions = [
        new Vector2D(0, 0),
        new Vector2D(100, 450),
        new Vector2D(340, 140),
        new Vector2D(340, 300),
        new Vector2D(340, 450),
        new Vector2D(340, 600),
        new Vector2D(340, 760),
        new Vector2D(630, 140),
        new Vector2D(630, 300),
        new Vector2D(630, 450),
        new Vector2D(630, 600),
        new Vector2D(630, 760),
        new Vector2D(1750, 450),
        new Vector2D(1220, 140),
        new Vector2D(1220, 300),
        new Vector2D(1220, 450),
        new Vector2D(1220, 600),
        new Vector2D(1220, 760),
        new Vector2D(1510, 140),
        new Vector2D(1510, 300),
        new Vector2D(1510, 450),
        new Vector2D(1510, 600),
        new Vector2D(1510, 760),
    ];

    playerSize = new Vector2D(70, 70);

    ballStartPosition = new Vector2D(960, 484);
    ballSize = new Vector2D(40, 40);
}