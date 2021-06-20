const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const BG_WIDTH = 2500;
const BG_HEIGHT = 800;
const NUM_ROCKS = 5;
const NUM_BUBBLES = 5; // 5
const NUM_SEAWEEDS = 15; // 15
const NUM_SHARKS = 5; // 5
const NUM_PLASTICBAGS = 25; // 25
const TOTAL_NUM_ITEMS =
  NUM_BUBBLES + NUM_SEAWEEDS + NUM_SHARKS + NUM_PLASTICBAGS;
const FONT_SIZE = 20;

var GameScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function GameScene() {
    Phaser.Scene.call(this, { key: "gameScene", active: true });
  },

  preload: function () {
    score = 0;
    numBagsCollected = 0;
    numBubblesCollected = 0;
    gameOver = false;
    withDiver = false;
    inBubble = false;

    this.load.image("background", "assets/background.png");
    this.load.image("rock", "assets/rock.png");
    this.load.image("plasticBag", "assets/plasticbag.png");
    this.load.image("bubble", "assets/bubble.png");
    this.load.image("seaweed", "assets/seaweed.png");
    this.load.image("shark", "assets/shark.png");
    this.load.image("turtle", "assets/turtle.png");
    this.load.image("diver", "assets/diver.png");
  },

  create: function () {
    //  A simple background for our game
    this.add.image(0, 0, "background").setOrigin(0, 0);

    //  Set the camera bounds to be the size of the image
    this.cameras.main.setBounds(0, 0, BG_WIDTH, BG_HEIGHT);

    // Set world bounds
    this.physics.world.setBounds(0, 0, BG_WIDTH, BG_HEIGHT);

    scoreText.setText(score);

    // Make rocks
    rocks = this.physics.add.staticGroup();
    for (var i = 0; i < NUM_ROCKS; i++) {
      // parameters
      var x = Phaser.Math.RND.between(0, BG_WIDTH);
      var y = Phaser.Math.RND.between(720, BG_HEIGHT);
      rocks.create(x, y, "rock");
    }

    // The player and its settings
    player = this.physics.add.image(100, 450, "turtle").setScale(0.5);

    // Camera follows player
    this.cameras.main.startFollow(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Add diver at end of map at 2200, 200
    diver = this.physics.add.image(2200, 200, "diver");

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    // add objects randomly
    bubbles = this.physics.add.group();
    seaweeds = this.physics.add.group();
    sharks = this.physics.add.group();
    plasticBags = this.physics.add.group();

    for (var i = 0; i < TOTAL_NUM_ITEMS; i++) {
      // parameters
      var x = Phaser.Math.RND.between(200, BG_WIDTH);
      var y = Phaser.Math.RND.between(0, BG_HEIGHT);
      var object;
      if (i < NUM_BUBBLES) {
        // 5 bubbles
        object = bubbles.create(x, y, "bubble");
        object.setScale(0.75);
      } else if (i < NUM_BUBBLES + NUM_SEAWEEDS) {
        // 15 seaweed
        object = seaweeds.create(x, y, "seaweed");
        object.setScale(0.5);
      } else if (i < NUM_BUBBLES + NUM_SEAWEEDS + NUM_SHARKS) {
        // 5 sharks
        object = sharks.create(x, y, "shark");
        object.setVelocity(Phaser.Math.Between(-150, 150), 10);
        object.setBounce(1);
        object.setCollideWorldBounds(true);
        continue;
      } else {
        // 25 plastic bags
        object = plasticBags.create(x, y, "plasticBag");
        object.setScale(0.5);
      }
      object.setVelocity(Phaser.Math.Between(-50, 50), 5);
      object.setBounce(1);
      object.setCollideWorldBounds(true);
    }

    // Collide the player and other objects with the rocks
    this.physics.add.collider(player, rocks);
    this.physics.add.collider(plasticBags, rocks);
    this.physics.add.collider(seaweeds, rocks);
    this.physics.add.collider(bubbles, rocks);
    this.physics.add.collider(sharks, rocks);

    // Checks to see if the player overlaps with any of the collectibles
    // var collectibles = [bubbles, plasticBags];
    this.physics.add.overlap(
      player,
      plasticBags,
      collectPlasticBag,
      null,
      this
    );
    this.physics.add.overlap(player, bubbles, collectBubble, null, this);

    // Check for collisions with obstacles
    var obstacles = [seaweeds, sharks];
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    // Check if collided with diver
    this.physics.add.collider(player, diver, talkToDiver, null, this);
  },

  update: function () {
    if (gameOver) {
      if (cursors.space.isDown) {
        this.scene.restart();
      } else {
        return;
      }
    }

    if (withDiver) {
      if (cursors.space.isDown) {
        this.scene.restart();
      } else {
        return;
      }
    }

    if (inBubble) {
      if (cursors.space.isDown) {
        this.physics.resume();
      } else {
        return;
      }
    }

    if (cursors.left.isDown) {
      player.setVelocityX(-15);
      player.x -= 3;
      player.setScale(-0.5, 0.5); // flip image
    } else if (cursors.right.isDown) {
      player.setVelocityX(15);
      player.x += 3;
      player.setScale(0.5, 0.5); // flip image
    } else if (cursors.up.isDown) {
      player.setVelocityY(-15);
      player.y -= 3;
    } else if (cursors.down.isDown) {
      player.setVelocityY(15);
      player.y += 3;
    }
  },
});

var ScoreScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function ScoreScene() {
    Phaser.Scene.call(this, { key: "scoreScene", active: true });
  },

  preload: function () {},

  create: function () {
    scoreText = this.add.text(16, 16, "0", {
      fontFamily: "Arial",
      fontSize: 40,
      color: "#fff",
    });
  },

  update: function () {},
});

var BubbleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BubbleScene() {
    Phaser.Scene.call(this, { key: "bubbleScene" });
  },

  preload: function () {
    this.load.json("jsonData", "data/facts.json");
  },

  create: function () {
    // Choose random fact
    console.log(this.cache.json.get("jsonData"));
    facts = this.cache.json.get("jsonData").facts;
    var randomIndex = Phaser.Math.RND.between(0, 16);
    var content = [
      "You popped a fact bubble! Did you know:",
      "\n",
      facts[randomIndex],
      "\n",
      "Press SPACE to continue.",
    ];

    // Make text box
    graphics = this.add.graphics({
      fillStyle: {
        color: 0xc3e6ee, // light blue
        alpha: 0.75,
      },
    });
    graphics.fillRoundedRect(CANVAS_WIDTH / 8, CANVAS_HEIGHT / 4, 600, 300, 20);
    var mask = new Phaser.Display.Masks.GeometryMask(this, graphics);
    var text = this.add
      .text(CANVAS_WIDTH / 8 + 40, CANVAS_HEIGHT / 4 + 40, content, {
        fontSize: FONT_SIZE,
        fontFamily: "Arial",
        color: "#005C7A",
        wordWrap: { width: 600 - 80 },
      })
      .setOrigin(0);
    text.setMask(mask);
  },

  update: function () {
    if (cursors.space.isDown) {
      graphics.destroy();
      inBubble = false;
    }
  },
});

var WinScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function WinScene() {
    Phaser.Scene.call(this, { key: "winScene" });
  },

  preload: function () {},

  create: function () {
    // Cover singular or plural bags/bubbles
    var bags = "plastic bags";
    var bubbles = "bubbles";
    if (numBagsCollected == 1) {
      bags = "plastic bag";
    }
    if (numBubblesCollected == 1) {
      bubbles = "bubble";
    }

    // Set up text box content
    var content = [
      "Thank you for your help, Mr. Turtle! I couldn't have done it without you.",
      "\n",
      "You collected " +
        numBagsCollected +
        " " +
        bags +
        " and popped " +
        numBubblesCollected +
        " " +
        bubbles +
        ".",
      "Your final score is " + score + "!",
      "\n",
      "Press SPACE to play again.",
    ];

    // Make text box
    graphics = this.add.graphics({
      fillStyle: {
        color: 0xf6e5ac, // yellow
        alpha: 0.75,
      },
    });
    graphics.fillRoundedRect(CANVAS_WIDTH / 8, CANVAS_HEIGHT / 4, 600, 300, 20);
    var mask = new Phaser.Display.Masks.GeometryMask(this, graphics);
    var text = this.add
      .text(CANVAS_WIDTH / 8 + 40, CANVAS_HEIGHT / 4 + 40, content, {
        fontSize: FONT_SIZE,
        fontFamily: "Arial",
        color: "#005C7A",
        wordWrap: { width: 600 - 80 },
      })
      .setOrigin(0);
    text.setMask(mask);
  },

  update: function () {
    if (cursors.space.isDown) {
      graphics.destroy();
      withDiver = false;
    }
  },
});

var LossScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function LossScene() {
    Phaser.Scene.call(this, { key: "lossScene" });
  },

  preload: function () {},

  create: function () {
    // Cover singular or plural bags/bubbles
    var bags = "plastic bags";
    var bubbles = "bubbles";
    if (numBagsCollected == 1) {
      bags = "plastic bag";
    }
    if (numBubblesCollected == 1) {
      bubbles = "bubble";
    }

    // Set up text box content
    var content = [
      "Oh no, watch out!",
      "\n",
      "You collected " +
        numBagsCollected +
        " " +
        bags +
        " and popped " +
        numBubblesCollected +
        " " +
        bubbles +
        ".",
      "Your final score is " + score + ".",
      "\n",
      "Press SPACE to try again.",
    ];

    // Make text box
    graphics = this.add.graphics({
      fillStyle: {
        color: 0xb67975, // pink
        alpha: 0.75,
      },
    });
    graphics.fillRoundedRect(CANVAS_WIDTH / 8, CANVAS_HEIGHT / 4, 600, 300, 20);
    var mask = new Phaser.Display.Masks.GeometryMask(this, graphics);
    var text = this.add
      .text(CANVAS_WIDTH / 8 + 40, CANVAS_HEIGHT / 4 + 40, content, {
        fontSize: FONT_SIZE,
        fontFamily: "Arial",
        color: "#fff",
        wordWrap: { width: 600 - 80 },
      })
      .setOrigin(0);
    text.setMask(mask);
  },

  update: function () {
    if (cursors.space.isDown) {
      graphics.destroy();
      gameOver = false;
    }
  },
});

var config = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [GameScene, ScoreScene, BubbleScene, WinScene, LossScene],
};

var player;
var plasticBags;
var bubbles;
var seaweeds;
var sharks;
var rocks;
var diver;

var cursors;
var graphics;
var scoreText;
var score;
var numBagsCollected;
var numBubblesCollected;
var gameOver;
var withDiver;
var inBubble;

var game = new Phaser.Game(config);

function collectPlasticBag(player, plasticBag) {
  plasticBag.disableBody(true, true);
  score += 10;
  numBagsCollected += 1;
  scoreText.setText(score);
}

function collectBubble(player, bubble) {
  bubble.disableBody(true, true);
  score += 100;
  numBubblesCollected += 1;
  scoreText.setText(score);
  inBubble = true;
  this.physics.pause();
  this.scene.launch("bubbleScene");
}

function hitObstacle(player, obstacle) {
  console.log("GAME OVER");
  gameOver = true;
  this.physics.pause();
  player.setTint(0xff0000);
  this.scene.launch("lossScene");
}

function talkToDiver(player, diver) {
  console.log("Talking to diver");
  withDiver = true;
  this.physics.pause();
  this.scene.launch("winScene");
}
