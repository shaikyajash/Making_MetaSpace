// src/initGame.js
import websocketService from './services/websocket';
import initKaplay from "./kaplayCtx";

const initGame = () => {
  // Constants
  const GAME_CONFIG = {
    width: 1920,
    height: 1080,
    wallThickness: 15,
    playerSpeed: 300,
    diagonalFactor: 1 / Math.sqrt(2)
  };

  // Game state
  const k = initKaplay();
  let mainPlayer = null;
  let mainPlayerId = null;
  const otherPlayers = new Map();

  // Initialize game assets
  const initializeAssets = () => {
    k.loadSprite("background", "./NewPiskel.png");
    k.loadSprite("characters", "./sprite.png", {
      sliceY: 6,
      sliceX: 6,
      anims: {
        "down-idle": 21,
        "up-idle": 0,
        "right-idle": 24,
        "left-idle": 8,
        right: { from: 25, to: 31, loop: true },
        left: { from: 9, to: 15, loop: true },
        down: { from: 17, to: 23, loop: true },
        up: { from: 1, to: 7, loop: true },
      },
    });
  };

  // Create game world
  const createGameWorld = () => {
    // Add background
    k.add([k.sprite("background"), k.pos(0, -70), k.scale(8)]);

    // Add walls
    const walls = [
      { width: GAME_CONFIG.width, height: GAME_CONFIG.wallThickness, x: 0, y: 0 },
      { width: GAME_CONFIG.width, height: GAME_CONFIG.wallThickness, x: 0, y: GAME_CONFIG.height - GAME_CONFIG.wallThickness },
      { width: GAME_CONFIG.wallThickness, height: GAME_CONFIG.height, x: 0, y: 0 },
      { width: GAME_CONFIG.wallThickness, height: GAME_CONFIG.height, x: GAME_CONFIG.width - GAME_CONFIG.wallThickness, y: 0 }
    ];

    walls.forEach(wall => {
      k.add([
        k.rect(wall.width, wall.height),
        k.pos(wall.x, wall.y),
        k.color(0, 0, 0),
      ]);
    });
  };

  // Player creation
  const createPlayer = (id, initialPos = k.center()) => {
    return k.add([
      k.sprite("characters", { anim: "down-idle" }),
      k.pos(initialPos),
      k.anchor("center"),
      k.scale(1),
      {
        playerId: id,
        speed: GAME_CONFIG.playerSpeed,
        direction: k.vec2(0, 0),
        currentAnim: "down-idle",
      },
      "player"
    ]);
  };

  // Collision detection
  const checkCollisionWithWalls = (pos) => {
    return (
      pos.x < GAME_CONFIG.wallThickness ||
      pos.x > GAME_CONFIG.width - GAME_CONFIG.wallThickness ||
      pos.y < GAME_CONFIG.wallThickness ||
      pos.y > GAME_CONFIG.height - GAME_CONFIG.wallThickness
    );
  };

  // Animation helper
  const getNewAnimation = (direction, currentAnim) => {
    if (direction.eq(k.vec2(0, 0))) {
      return currentAnim.includes('idle') ? currentAnim : `${currentAnim}-idle`;
    }
    if (direction.x < 0) return "left";
    if (direction.x > 0) return "right";
    if (direction.y < 0) return "up";
    if (direction.y > 0) return "down";
    return currentAnim;
  };

  // Player controls
  const setupPlayerControls = (player) => {
    player.onUpdate(() => {
      const prevPos = player.pos.clone();
      const prevAnim = player.getCurAnim().name;

      // Handle movement
      player.direction = k.vec2(
        (k.isKeyDown("right") ? 1 : 0) - (k.isKeyDown("left") ? 1 : 0),
        (k.isKeyDown("down") ? 1 : 0) - (k.isKeyDown("up") ? 1 : 0)
      );

      // Calculate new position
      const moveScale = player.direction.x && player.direction.y ? 
        GAME_CONFIG.diagonalFactor : 1;
      const newPos = player.pos.add(
        player.direction.scale(moveScale * player.speed * k.dt())
      );

      // Handle collisions and movement
      if (!checkCollisionWithWalls(newPos)) {
        player.pos = newPos;
      }

      // Update animation
      const newAnim = getNewAnimation(player.direction, prevAnim);
      if (newAnim !== player.currentAnim) {
        player.play(newAnim);
        player.currentAnim = newAnim;
      }

      // Send updates if position or animation changed
      if (!prevPos.eq(player.pos) || prevAnim !== player.currentAnim) {
        websocketService.send({
          type: 'PLAYER_UPDATE',
          position: { x: player.pos.x, y: player.pos.y },
          animation: player.currentAnim
        });
      }
    });
  };

  // WebSocket event handlers
  const setupWebSocketHandlers = () => {
    websocketService.on('INIT', (data) => {
      mainPlayerId = data.playerId;
      mainPlayer = createPlayer(data.playerId);
      setupPlayerControls(mainPlayer);
      
      data.players.forEach((p) => {
        if (p.id !== data.playerId) {
          otherPlayers.set(p.id, createPlayer(p.id, k.vec2(p.position.x, p.position.y)));
        }
      });
    });

    websocketService.on('PLAYER_JOINED', (data) => {
      otherPlayers.set(
        data.player.id,
        createPlayer(data.player.id, k.vec2(data.player.position.x, data.player.position.y))
      );
    });

    websocketService.on('PLAYER_UPDATED', (data) => {
      const player = otherPlayers.get(data.playerId);
      if (player) {
        player.pos = k.vec2(data.position.x, data.position.y);
        if (player.currentAnim !== data.animation) {
          player.play(data.animation);
          player.currentAnim = data.animation;
        }
      }
    });

    websocketService.on('PLAYER_LEFT', (data) => {
      const player = otherPlayers.get(data.playerId);
      if (player) {
        player.destroy();
        otherPlayers.delete(data.playerId);
      }
    });
  };

  // Initialize game
  initializeAssets();
  createGameWorld();
  setupWebSocketHandlers();

  // Return cleanup function
  return () => {
    otherPlayers.clear();
  };
};

export default initGame;