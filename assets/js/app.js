let font;
let buttons = {
  music: null,
  musicImg: null,
};
let bgImage, bgMusic, speedUpSound, smashGlassSound;
let RedBars, BlackBars, YellowBars, WhiteBars, AllBars;
let ship, shipImg, crosshair;
let currentSpeed = 5;
let movementPadding = 50;
let asteroid, asteroids, asteroidImg, bgAsteroid, bgAsteroids;
let exhastBeams;
let score = 0, distance = 0, showMetricFact, metricFact;

// Game States
let startMenu = false, gameOver = false, paused = false, optionsMenu = false;

// Player States
let playerBouncing = false, bouncingDirection, playerOverlapping = false;

function preload() {
  let staticDir = 'assets/static/';
  font = loadFont('assets/css/Orbitron-Bold.ttf');
  bgMusic = loadSound(staticDir + 'sounds/7_SciFiAmbient.mp3');
  speedUpSound = loadSound(staticDir + 'sounds/Power-Up-KP-1879176533.mp3');
  smashGlassSound = loadSound(staticDir + 'sounds/Smashing-Yuri_Santana-1233262689.mp3');
  bgImage = loadImage(staticDir + 'bg/bg_1.png');
  shipImg = loadImage(staticDir + 'ships/ship_1.png');
  asteroidImg = loadImage(staticDir + 'objects/asteroid.png');
  
  buttons.musicImg = loadImage(staticDir + 'buttons/sound_on_bt.png');
  // buttons.music_off = loadImage(staticDir + 'buttons/sound_on_bt.png');
  
}

function setup() {
  // Prep Canvas
  createCanvas(windowWidth, windowHeight);
  background(bgImage, 100);
  
  // Prep Sounds
  bgMusic.setVolume(0.25);
  speedUpSound.setVolume(0.1);
  smashGlassSound.setVolume(0.1);
  // Play Background music on loop
  bgMusic.loop(0);
  
  // Music buttons
  // buttons.music = createSprite(70, camera.position.y - height / 2 + 90);
  // buttons.music.addImage("normal", buttons.musicImg);
  // buttons.music.setCollider('circle', 0, 0, 150);
  // buttons.music.debug = true;
  // buttons.music.scale = .15;
  // buttons.music.
  
  // Create Ship
  ship = createSprite(int(width / 5), int(height * 8 / 9));
  ship.maxSpeed = 30;
  ship.mass = ship.scale = .25;
  ship.friction = .3;
  ship.setCollider('circle', 0, 0, 85);
  ship.addImage("normal", shipImg);
  // ship.debug = true;
  
  // Handle speeds and distance
  // ship.velocity.y = crosshair.velocity.y = 3.25;
  
  // Steady Camera
  camera.position.x = width/2;
  
  // Create Groups
  RedBars = new Group();
  BlackBars = new Group();
  YellowBars = new Group();
  WhiteBars = new Group();
  AllBars = new Group();
  
  bgAsteroids = new Group();
  asteroids = new Group();
  exhastBeams = new Group();
}

function draw() {
  if (currentSpeed === 0)
    gameOver = true;
  
  if (gameOver && keyWentDown(32))
    newGame();
  
  if (!gameOver && !paused) {
    // Movement Controls
    ship.rotation = 0;
    if (!playerBouncing) {
      if (keyDown(LEFT_ARROW)) {
        if (ship.position.x > movementPadding) {
          ship.velocity.x -= 3.75;
          ship.rotation = -45
        }
      }
      if (keyDown(RIGHT_ARROW)) {
        if (ship.position.x < width - movementPadding) {
          ship.velocity.x += 3.75;
          ship.rotation = 45
        }
      }
    } else {
      //debugger;
      if (bouncingDirection === 'right')
        ship.position.x -= 10;
      else
        ship.position.x += 10 ;
    }
    
    // Draw game elements
    drawBars();
    drawAsteroids();
    drawBgAsteroids();
    drawExhaust();
    
    // Bad Collisions
    ship.collide(asteroids, debouncedRedCollision);
    ship.bounce(RedBars, debouncedRedCollision);
    ship.bounce(BlackBars, debouncedBlackCollision);
    // Good Collisions
    ship.overlap(YellowBars, debouncedYellowCollision);
    ship.overlap(WhiteBars, debouncedWhiteCollision);
    // Move it
    ship.position.y -= currentSpeed;
    camera.position.y = ship.position.y - height/3;
    // ship.position.y = crosshair.position.y + 100;
    // Track distance
    distance += currentSpeed;
    score += currentSpeed;
  }
  
  camera.off();
  // Makes background stationary
  background(bgImage, 100);
  camera.on();
  drawSprites();
  
  drawUI();
}

getMetricFact = _.debounce(function () {
  let round = ceil(distance/1000) * 1000; // round to nearest 1000
  // Decided to use /random because the numbers generated from round
  // and sent to the API yielded boring results
  httpGet(`http://numbersapi.com/random/math`, 'text', false, function (response) {
    showMetricFact = true;
    metricFact = response;
    setTimeout(function () {
      showMetricFact = false;
    }, 5000)
  });
}, 1000, true);

function newGame() {
  gameOver = false;
  ship.position.x = int(width / 5);
  currentSpeed = 5;
  distance = 0;
  score = 0;
}

function drawAsteroids() {
  if (frameCount % 15 === 0) {
    asteroid = createSprite(random(50, width - 50), ship.position.y - height);
    asteroid.setSpeed(random(currentSpeed), 90);
    asteroid.addImage('normal', asteroidImg);
    // asteroid.rotation += 5;
    // asteroid.debug = true;
    asteroid.setCollider('circle', 0, 0, 60);
    asteroid.addToGroup(asteroids);
  }
  
  // bgAsteroid Cleanup
  asteroids.forEach((ast) => {
    if (ast.position.y > camera.position.y + height) {
      ast.remove();
    }
  })
}
function drawBgAsteroids() {
  // Spawn bgAsteroids
  if (frameCount % 3 === 0) {
    bgAsteroid = createSprite(random(50, width - 50), ship.position.y - height);
    bgAsteroid.setSpeed(currentSpeed * 2, 90);
    bgAsteroid.draw = function () {
      stroke(255, 255, 255, random(50, 100));
      line(0, 0, 0, 20)
    }; // Will display the sprite as circle.
    // bgAsteroid.life = 100;
    bgAsteroid.addToGroup(bgAsteroids);
  }
  // bgAsteroid Cleanup
  bgAsteroids.forEach((ast) => {
    if (ast.position.y > camera.position.y + height) {
      ast.remove();
    }
  })
}

function drawExhaust() {
  // Create Ship's Exhaust
  if (frameCount) {
    let exhaustBeam = createSprite(ship.position.x, ship.position.y);
    exhaustBeam.position.y = ship.position.y;
    exhaustBeam.velocity.y = 1;
    exhaustBeam.draw = function () {
      let distanceFromCenter = 21;
      let width = 2.5;
      stroke('white');
      strokeWeight(10);
      line(distanceFromCenter, -width, distanceFromCenter, width);
      stroke(255, 255, 255, 33);
      line(distanceFromCenter, -(width * 3), distanceFromCenter, width * 3);
    };
    exhaustBeam.rotateToDirection = true;
    exhaustBeam.rotation = 90;
    if (keyDown(LEFT_ARROW))
      exhaustBeam.rotation = 90 - 60;
    if (keyDown(RIGHT_ARROW))
      exhaustBeam.rotation = 90 + 60;
    exhaustBeam.life = 90;
    exhaustBeam.addToGroup(exhastBeams);
  }
  // Exhaust Cleanup
  /*exhastBeams.forEach((beam, index) => {
    if (beam.position.y > camera.position.y + height) {
      beam.remove();
    }
  })*/
}

function drawBars() {
  let previousBar, startingPosition;
  // Spawn Walls
  if (AllBars.length < 30) {
    // Get previous bar
    if (AllBars.length) {
      previousBar = AllBars[AllBars.length - 1];
      startingPosition = previousBar.position.y - previousBar.height;
    } else {
      startingPosition = camera.position.y + height / 2;
    }
    
    // create new bar
    let barHeight = 175;
    let barWidth = 25;
    let bar = createSprite(width / 2, startingPosition, barWidth, barHeight);
    let colors = ['red', 'black', 'white', 'yellow'];
    let setColor = colors[floor(random(4))];
    
    bar.setCollider('rectangle', 0, 0, barWidth, barHeight);
    bar.debug = true;
    // bar.life = 500;
    noStroke();
    switch (setColor) {
      case 'black':
        bar.draw = () => {
          fill(setColor);
          rect(0, 0, barWidth, barHeight);
        };
        bar.mass = 100;
        bar.immovable = true;
        bar.addToGroup(BlackBars);
        break;
      case 'red':
        bar.draw = () => {
          fill(setColor);
          rect(0, 0, barWidth, barHeight);
        };
        bar.mass = 100;
        bar.immovable = true;
        bar.addToGroup(RedBars);
        break;
      case 'white':
        bar.draw = function () {
          fill(setColor);
          rect(0, 0, barWidth, barHeight);
          fill(255, 255, 255, 66);
          rect(0, 0, barWidth + 10, barHeight);
        };
        bar.addToGroup(WhiteBars);
        break;
      case 'yellow':
        bar.draw = function () {
          noStroke();
          fill(setColor);
          rect(0, 0, barWidth, barHeight);
          fill(255, 242, 0, 66);
          rect(0, 0, barWidth + 10, barHeight);
        };
        bar.addToGroup(YellowBars);
        break;
    }
    bar.addToGroup(AllBars);
  }
  
  AllBars.forEach((thisBar, index) => {
    if (thisBar.position.y > camera.position.y + height) {
      thisBar.remove();
    }
  })
  
}

function redCollision(player, bar) {
  if (!playerBouncing) {
    console.log('Bounce Off, Die');
    playerBouncing = true;
    bouncingDirection = player.rotation > 360 ? 'right' : 'left';
    if (bouncingDirection === 'right') { //bounce right
      player.rotation -= 90;
      player.setSpeed(3, player.rotation - 90);
      // player.position.x-=5;
    } else { //bounce left
      player.rotation += 90;
      player.setSpeed(3, player.rotation + 90);
      // player.position.x+=5;
    }
  
    debouncedToggleBouncingState(false, true)
  }
}

function blackCollision(player, bar) {
  if (!playerBouncing) {
    console.log('Bounce Off, SlowDown, Survive');
    playerBouncing = true;
    bouncingDirection = player.rotation > 360 ? 'right' : 'left';
    if (bouncingDirection === 'right') { //bounce right
      player.setSpeed(3, player.rotation - 60);
      // player.position.x-=5;
    } else { //bounce left
      player.setSpeed(3, player.rotation + 60);
      // player.position.x+=5;
    }
    currentSpeed--;
    debouncedToggleBouncingState()
  }
}

function whiteCollision() {
  if (!playerBouncing) {
    console.log('Break through, Accelerate');
    currentSpeed++;
    speedUpSound.play();
    smashGlassSound.play();
  }
}

function yellowCollision() {
  if (!playerBouncing) {
    console.log('Break, Accelerate, Collect Credits');
    currentSpeed++;
    score += 1000;
    speedUpSound.play();
    smashGlassSound.play();
  }
}

function toggleBouncingState(state = false, end = false) {
  playerBouncing = state;
  gameOver = end;
}

debouncedToggleBouncingState = _.debounce(toggleBouncingState, 300);

debouncedRedCollision = _.debounce(redCollision, 1000, true);
debouncedBlackCollision = _.debounce(blackCollision, 1000, true);
debouncedWhiteCollision = _.debounce(whiteCollision, 1000, true);
debouncedYellowCollision = _.debounce(yellowCollision, 1000, true);

function keyPressed() {
  switch (keyCode) {
    case KEY.SPACE:
      if (gameOver) {
        newGame();
        break;
      }
      paused = !paused;
      updateSprites(!paused);
      break;
    case KEY.M:
      if (bgMusic.isPaused())
        bgMusic.loop();
      else
        bgMusic.pause();
      break;
    case KEY.S:
      
      break;
  }
}

function mousePressed() {

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(bgImage, 33);
}

function drawUI() {
  // Spawn Distance Score
  textFont(font, 16);
  textAlign(LEFT);
  fill('white');
  text(`Score: ${score}`, 50, camera.position.y - height / 2 + 40);
  text(`Speed: ${currentSpeed}`, 50, camera.position.y - height / 2 + 60);
  //buttons.music.position.y = camera.position.y - height / 2 + 90;
  
  // Show Metric Trivia
  if (showMetricFact) {
    textFont(font, 16);
    textAlign(CENTER);
    fill('white');
    text('Did you know:', width/2, camera.position.y - height / 2 + 40);
    text(metricFact, width/4, camera.position.y - height / 2 + 60, width/2);
  }
  // Get Metric Fact
  if (second() % 20 == 0) {
    getMetricFact();
  }
  
  if (gameOver || paused) {
    noStroke();
    fill(0, 0, 0, 80);
    rect(camera.position.x - width/2, height, camera.position.x + width/2, 0);
    textFont(font, 32);
    textAlign(CENTER);
    fill('white');
    if (gameOver)
      text('Game Over', width/2, camera.position.y);
    else
      text('Paused', width/2, camera.position.y );
    
    text('Press SPACE to continue...', width/2, camera.position.y + 80);
  }
  
}