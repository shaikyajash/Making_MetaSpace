import websocketService from './services/websocket';
import initKaplay from "./kaplayCtx";

const initGame = () => {
  const DIAGONAL_FACTOR = 1 / Math.sqrt(2);
  const k = initKaplay();
  let mainPlayer = null;
  const otherPlayers = new Map();

  // Game boundaries
  const GAME_WIDTH = 1920;
  const GAME_HEIGHT = 1080;
  const WALL_THICKNESS = 10;

  // Load sprites
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

  // Add background
  k.add([k.sprite("background"), k.pos(0, -70), k.scale(8)]);

  // Add walls
  k.add([
    k.rect(GAME_WIDTH, WALL_THICKNESS),
    k.pos(0, 0),
    k.color(0, 0, 0),
  ]);

  k.add([
    k.rect(GAME_WIDTH, WALL_THICKNESS),
    k.pos(0, GAME_HEIGHT - WALL_THICKNESS),
    k.color(0, 0, 0),
  ]);

  k.add([
    k.rect(WALL_THICKNESS, GAME_HEIGHT),
    k.pos(0, 0),
    k.color(0, 0, 0),
  ]);

  k.add([
    k.rect(WALL_THICKNESS, GAME_HEIGHT),
    k.pos(GAME_WIDTH - WALL_THICKNESS, 0),
    k.color(0, 0, 0),
  ]);

  const createPlayer = (id, initialPos = k.center()) => {
    return k.add([
      k.sprite("characters", { anim: "down-idle" }),
      k.pos(initialPos),
      k.anchor("center"),
      k.scale(1),
      {
        playerId: id,
        speed: 300,
        direction: k.vec2(0, 0),
        currentAnim: "down-idle",
      },
      "player"
    ]);
  };

  // WebSocket event handlers
  websocketService.on('INIT', (data) => {
    mainPlayer = createPlayer(data.playerId);
    setupPlayerControls(mainPlayer);
    
    data.players.forEach((p) => {
      if (p.id !== data.playerId) {
        const remotePlayer = createPlayer(p.id, k.vec2(p.position.x, p.position.y));
        otherPlayers.set(p.id, remotePlayer);
      }
    });
  });

  websocketService.on('PLAYER_JOINED', (data) => {
    const remotePlayer = createPlayer(data.player.id, k.vec2(data.player.position.x, data.player.position.y));
    otherPlayers.set(data.player.id, remotePlayer);
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

  const checkCollisionWithWalls = (pos) => {
    return (
      pos.x < WALL_THICKNESS ||
      pos.x > GAME_WIDTH - WALL_THICKNESS ||
      pos.y < WALL_THICKNESS ||
      pos.y > GAME_HEIGHT - WALL_THICKNESS
    );
  };

  const setupPlayerControls = (player) => {
    player.onUpdate(() => {
      // Store previous position
      player.prevPos = player.pos.clone();
      const prevAnim = player.getCurAnim().name;

      player.direction.x = 0;
      player.direction.y = 0;

      if (k.isKeyDown("left")) player.direction.x = -1;
      if (k.isKeyDown("right")) player.direction.x = 1;
      if (k.isKeyDown("up")) player.direction.y = -1;
      if (k.isKeyDown("down")) player.direction.y = 1;

      // Calculate new position
      let newPos = player.pos.clone();
      if (player.direction.x && player.direction.y) {
        newPos = newPos.add(player.direction.scale(DIAGONAL_FACTOR * player.speed * k.dt()));
      } else {
        newPos = newPos.add(player.direction.scale(player.speed * k.dt()));
      }

      // Only check wall collisions
      const hasWallCollision = checkCollisionWithWalls(newPos);
      const canMove = !hasWallCollision;

      // Animation logic
      if (player.direction.eq(k.vec2(-1, 0)) && player.getCurAnim().name !== "left") {
        player.play("left");
        player.currentAnim = "left";
      } else if (player.direction.eq(k.vec2(1, 0)) && player.getCurAnim().name !== "right") {
        player.play("right");
        player.currentAnim = "right";
      } else if (player.direction.eq(k.vec2(0, -1)) && player.getCurAnim().name !== "up") {
        player.play("up");
        player.currentAnim = "up";
      } else if (player.direction.eq(k.vec2(0, 1)) && player.getCurAnim().name !== "down") {
        player.play("down");
        player.currentAnim = "down";
      } else if (player.direction.eq(k.vec2(0, 0)) && !player.getCurAnim().name.includes("idle")) {
        const newAnim = `${player.getCurAnim().name}-idle`;
        player.play(newAnim);
        player.currentAnim = newAnim;
      }

      // Move if no wall collision
      if (canMove) {
        player.pos = newPos;
      }

      // Keep in bounds (extra safety)
      const margin = WALL_THICKNESS;
      player.pos.x = Math.max(margin, Math.min(GAME_WIDTH - margin, player.pos.x));
      player.pos.y = Math.max(margin, Math.min(GAME_HEIGHT - margin, player.pos.y));

      // Send updates
      if (!player.prevPos.eq(player.pos) || prevAnim !== player.getCurAnim().name) {
        websocketService.send({
          type: 'PLAYER_UPDATE',
          position: { x: player.pos.x, y: player.pos.y },
          animation: player.getCurAnim().name
        });
      }
    });
  };
};

export default initGame;