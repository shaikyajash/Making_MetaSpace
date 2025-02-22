// frontend/src/initGame.js
import initKaplay from "./kaplayCtx";

const initGame = (socket, playerId, players) => {
  const DIAGONAL_FACTOR = 1 / Math.sqrt(2);
  const k = initKaplay();
  let mainPlayer = null;
  const otherPlayers = new Map();

  const BACKGROUND_CONFIG = {
    width: 368,
    height: 192,
    scale: 8,
    margin: 20,
  };

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
  k.add([k.sprite("background"), k.pos(0, 0), k.scale(BACKGROUND_CONFIG.scale)]);

  const isWithinBounds = (pos) => {
    const minX = BACKGROUND_CONFIG.margin;
    const maxX = (BACKGROUND_CONFIG.width * BACKGROUND_CONFIG.scale) - BACKGROUND_CONFIG.margin;
    const minY = BACKGROUND_CONFIG.margin;
    const maxY = (BACKGROUND_CONFIG.height * BACKGROUND_CONFIG.scale) - BACKGROUND_CONFIG.margin;

    return (
      pos.x >= minX &&
      pos.x <= maxX &&
      pos.y >= minY &&
      pos.y <= maxY
    );
  };

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
        isMovingToTarget: false,
        targetPos: null,
      },
      "player"
    ]);
  };

  const updatePlayerAnimation = (player, direction) => {
    let newAnim = player.currentAnim;

    if (direction.x < 0) newAnim = "left";
    else if (direction.x > 0) newAnim = "right";
    else if (direction.y < 0) newAnim = "up";
    else if (direction.y > 0) newAnim = "down";
    else newAnim = `${player.currentAnim.split('-')[0]}-idle`;

    if (newAnim !== player.currentAnim) {
      player.play(newAnim);
      player.currentAnim = newAnim;
    }
  };

  const emitUpdate = (position, animation) => {
    socket?.emit('PLAYER_UPDATE', {
      position,
      animation
    });
  };

  const setupPlayerControls = (player) => {
    // Mouse click movement
    k.onClick(() => {
      if (!player) return;
      
      const mousePos = k.mousePos();
      const worldPos = k.toWorld(mousePos);
      
      if (isWithinBounds(worldPos)) {
        player.targetPos = worldPos;
        player.isMovingToTarget = true;
      }
    });

    k.onUpdate(() => {
      if (!player) return;

      player.prevPos = player.pos.clone();
      const prevAnim = player.currentAnim;

      // Handle keyboard input
      if (k.isKeyPressed("left") || k.isKeyPressed("right") || k.isKeyPressed("up") || k.isKeyPressed("down")) {
        player.isMovingToTarget = false;
        player.targetPos = null;
      }

      player.direction.x = 0;
      player.direction.y = 0;

      // Handle keyboard movement
      if (k.isKeyDown("left")) player.direction.x = -1;
      if (k.isKeyDown("right")) player.direction.x = 1;
      if (k.isKeyDown("up")) player.direction.y = -1;
      if (k.isKeyDown("down")) player.direction.y = 1;

      // Handle mouse movement
      if (player.isMovingToTarget && player.targetPos) {
        const diff = player.targetPos.sub(player.pos);
        const dist = diff.len();

        if (dist > 5) {
          const direction = diff.unit();
          player.direction = direction;
        } else {
          player.isMovingToTarget = false;
          player.targetPos = null;
          player.direction = k.vec2(0, 0);
        }
      }

      // Calculate new position
      let moveAmount;
      if (player.direction.x && player.direction.y) {
        moveAmount = player.direction.scale(DIAGONAL_FACTOR * player.speed * k.dt());
      } else {
        moveAmount = player.direction.scale(player.speed * k.dt());
      }

      // Calculate new position and check bounds
      const newPos = player.pos.add(moveAmount);
      if (isWithinBounds(newPos)) {
        player.pos = newPos;
      } else {
        // Clamp position to bounds
        player.pos = k.vec2(
          k.clamp(newPos.x, BACKGROUND_CONFIG.margin, (BACKGROUND_CONFIG.width * BACKGROUND_CONFIG.scale) - BACKGROUND_CONFIG.margin),
          k.clamp(newPos.y, BACKGROUND_CONFIG.margin, (BACKGROUND_CONFIG.height * BACKGROUND_CONFIG.scale) - BACKGROUND_CONFIG.margin)
        );
      }

      // Update animation based on movement direction
      updatePlayerAnimation(player, player.direction);

      // Send updates using Socket.IO
      if (!player.prevPos.eq(player.pos) || prevAnim !== player.currentAnim) {
        emitUpdate(
          { x: player.pos.x, y: player.pos.y },
          player.currentAnim
        );
      }
    });
  };

  // Camera follow with smooth movement
  const setupCamera = (player) => {
    k.onUpdate(() => {
      if (!player) return;
      const targetY = player.pos.y - 100;
      const currentPos = k.camPos();
      const smoothness = 0.1;

      k.camPos(
        k.lerp(currentPos.x, player.pos.x, smoothness),
        k.lerp(currentPos.y, targetY, smoothness)
      );
    });
  };

  // Set up socket event handlers for other players
  socket?.on('PLAYER_JOINED', (data) => {
    const remotePlayer = createPlayer(
      data.player.id,
      k.vec2(data.player.position.x, data.player.position.y)
    );
    otherPlayers.set(data.player.id, remotePlayer);
  });

  socket?.on('PLAYER_UPDATED', (data) => {
    const player = otherPlayers.get(data.playerId);
    if (player) {
      player.pos = k.vec2(data.position.x, data.position.y);
      if (player.currentAnim !== data.animation) {
        player.play(data.animation);
        player.currentAnim = data.animation;
      }
    }
  });

  socket?.on('PLAYER_LEFT', (data) => {
    const player = otherPlayers.get(data.playerId);
    if (player) {
      player.destroy();
      otherPlayers.delete(data.playerId);
    }
  });

  // Initialize main player
  if (playerId) {
    mainPlayer = createPlayer(playerId);
    setupPlayerControls(mainPlayer);
    setupCamera(mainPlayer);
  }

  // Initialize other players
  players.forEach((playerData, id) => {
    if (id !== playerId) {
      const remotePlayer = createPlayer(
        id,
        k.vec2(playerData.position.x, playerData.position.y)
      );
      otherPlayers.set(id, remotePlayer);
    }
  });

  // Return cleanup function
  return () => {
    if (mainPlayer) {
      mainPlayer.destroy();
    }
    otherPlayers.forEach(player => player.destroy());
    otherPlayers.clear();
    
    // Remove socket listeners
    socket?.off('PLAYER_JOINED');
    socket?.off('PLAYER_UPDATED');
    socket?.off('PLAYER_LEFT');
  };
};

export default initGame;