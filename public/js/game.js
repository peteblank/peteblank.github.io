var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  } 
};

var game = new Phaser.Game(config);
var player;
var platforms;
var cursors;
var blocks;
var coin;
var blocked = true;
var score = 0;
var scoreText;
var score2 = 0;
var scoreText2;
var scoreText3;
var punching = false;
var timerevent=0;
var initialTime;

function preload() {
  this.load.image('ship', 'assets/spaceShips_001.png');
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
  this.load.image("platform", "assets/platform2.png");
  this.load.image("play_block", "assets/play_block.jpg");
  this.load.spritesheet("dog", "assets/dogsprites.png ", {
    frameWidth: 56,
    frameHeight: 41
  });
  this.load.spritesheet("walk", "assets/dog_walk2.png ", {
    frameWidth: 48,
    frameHeight: 43
  });
  this.load.spritesheet("punch", "assets/dog_punchsprite.png ", {
    frameWidth: 80,
    frameHeight: 42
  });
  this.load.image("dud_block", "assets/dud_block.jpg");
  this.load.image("sky", "assets/sky.png");
  this.load.audio("brick", "assets/brick.wav");
  this.load.audio("jump", "assets/jump.ogg");
  this.load.audio("bgmusic", "assets/bgmusic.ogg");
  this.load.audio("coin_sound", "assets/coin.wav");
  this.load.image("coin", "assets/coin.png");
}

function create() {
  this.add.image(400, 300, "sky");
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  platforms = this.physics.add.staticGroup();
  blocks = this.physics.add.staticGroup();
  platforms.create(50, 490, "platform");
  platforms.create(381, 490, "platform");
  platforms.create(600, 490, "platform");
  for (i = 0; i < 14; i++) {
    blocks.create(100 + i * 42, 350, "play_block");
    blocks.create(100 + i * 42, 200, "play_block");
  }
  //player1
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on('playerMoved', function (playerInfo) {
    if (playerInfo.playerId === self.socket.id){
      self.ship.setPosition(playerInfo.x, playerInfo.y);
    }else{
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.rotation);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    }
  });
  function onEvent ()
    {
        this.initialTime -= 1; // One second
        scoreText3.setText(formatTime(this.initialTime));
    }
  function formatTime(seconds){
    // Minutes
    var minutes = Math.floor(seconds/60);
    // Seconds
    var partInSeconds = seconds%60;
    // Adds left zeros to seconds
    partInSeconds = partInSeconds.toString().padStart(2,'0');
    // Returns formated time
    
    return `${minutes}:${partInSeconds}`;
  }
  this.cursors = this.input.keyboard.createCursorKeys();

  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });
  this.initialTime=100;
  scoreText3 = this.add.text(300, 16, formatTime(this.initialTime),
   {
    fontSize: "32px",
    fill: "#000"
  });
  timerevent = this.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, loop: true });
  this.socket.on('scoreUpdate', function (scores) {
    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
  });

  this.socket.on('starLocation', function (starLocation) {
    if (self.star) self.star.destroy();
    self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
    self.physics.add.overlap(self.ship, self.star, function () {
      this.socket.emit('starCollected');
    }, null, self);
  });
}

function addPlayer(self, playerInfo) {
  self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  if (playerInfo.team === 'blue') {
    self.ship.setTint(0x0000ff);
  } else {
    self.ship.setTint(0xff0000);
  }
  self.ship.setDrag(100);
  self.ship.setAngularDrag(100);
  self.ship.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  if (playerInfo.team === 'blue') {
    otherPlayer.setTint(0x0000ff);
  } else {
    otherPlayer.setTint(0xff0000);
  }
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
  
}

function update() {
  if (this.ship) {
    if (this.cursors.left.isDown) {
      this.ship.setAngularVelocity(-150);
    } else if (this.cursors.right.isDown) {
      this.ship.setAngularVelocity(150);
    } else {
      this.ship.setAngularVelocity(0);
    }
  
    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
    } else {
      this.ship.setAcceleration(0);
    }
  
    this.physics.world.wrap(this.ship, 5);
    

    // emit player movement
    var x = this.ship.x;
    var y = this.ship.y;
    var r = this.ship.rotation;
    if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
    }
    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation
    };
  }
}