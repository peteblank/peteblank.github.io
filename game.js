// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#3498db',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Game variables
let player;
let greenBalls;
let score = 0;
let scoreText;
let highScore = 0;
let cursors; // Declare cursors variable globally

// Initialize the game
const game = new Phaser.Game(config);

function preload() {
    this.load.image('yellowBall', 'https://labs.phaser.io/assets/sprites/yellow_ball.png');
    this.load.image('greenBall', 'https://labs.phaser.io/assets/sprites/green_ball.png');
    this.load.image('wheat', 'https://labs.phaser.io/assets/sprites/wheat.png'); // Add wheat image
}


function create() {
    // Create player
    player = this.physics.add.image(400, 300, 'yellowBall');
    player.setCollideWorldBounds(true);
    player.setScale(0.5);
    
    // Create green balls group
    greenBalls = this.physics.add.group();
    
    // Spawn initial green balls
    spawnGreenBalls.call(this, 10);
    
    // Collision detection
    this.physics.add.overlap(player, greenBalls, eatGreenBall, null, this);
    
    // Score text
    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4
    });
    
    // Load high score (total score) from storage
    highScore = parseInt(getStorage('highScore')) || 0;
    document.getElementById('highScoreDisplay').textContent = `High Score: ${highScore}`;
    
    // Initialize keyboard controls
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // Reset velocity each frame to prevent continuous movement
    player.setVelocity(0);
    
    // Horizontal movement
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    }
    
    // Vertical movement
    if (cursors.up.isDown) {
        player.setVelocityY(-200);
    } else if (cursors.down.isDown) {
        player.setVelocityY(200);
    }
}

function spawnGreenBalls(count) {
    for (let i = 0; i < count; i++) {
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(50, 550);
        let ball = greenBalls.create(x, y, 'greenBall');
        ball.setScale(0.3);
    }
}

function eatGreenBall(player, greenBall) {
    addWheatImage();
    greenBall.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Spawn a new green ball
    spawnGreenBalls.call(this, 1);
    
    // Always add to high score (cumulative total)
    highScore += 10;
    document.getElementById('highScoreDisplay').textContent = `High Score: ${highScore}`;
    setStorage('highScore', highScore);
}

// Storage functions (replacing cookies)
function setStorage(key, value) {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
}

function getStorage(key) {
    const jsonString = localStorage.getItem(key);
    if (jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Error parsing JSON from storage:", e);
            return null;
        }
    }
    return null;
}
function addWheatImage() {
    const wheatDiv = document.createElement('div');
    wheatDiv.style.backgroundImage = 'url("wheat.jpg")';
    wheatDiv.style.width = '100px';
    wheatDiv.style.height = '100px';
    wheatDiv.style.backgroundSize = 'cover';
    wheatDiv.style.margin = '10px';
   
    wheatDiv.style.left = '0';
    wheatDiv.style.bottom = '0';
    wheatDiv.style.palign = 'center';
    const gameContainer = document.getElementById('wheat');
    wheatDiv.style.position = 'relative';
    wheatDiv.style.display = 'inline-block';
    gameContainer.appendChild(wheatDiv);
}

function resetScore() {
    score = 0;
    scoreText.setText('Score: ' + score);
    highScore = 0;
    document.getElementById('highScoreDisplay').textContent = `High Score: ${highScore}`;
    setStorage('highScore', highScore);
}

function handleWheatClick() {
    if (highScore >= 10) {
        highScore -= 10;
        document.getElementById('highScoreDisplay').textContent = `High Score: ${highScore}`;
        setStorage('highScore', highScore);

        const wheatContainer = document.getElementById('wheat');
        
        if (wheatContainer.lastChild) {
            wheatContainer.removeChild(wheatContainer.lastChild);
        }
        }
}



