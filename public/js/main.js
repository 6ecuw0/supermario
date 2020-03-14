import Camera from './Camera.js';
import Timer from './Timer.js';
import Entity from './Entity.js';
import { createLevelLoader } from './loaders/level.js';
import { loadEntities } from './entities.js';
import { createCollisionLayer } from './layers/collision.js';
import { setupKeyboard } from './input.js';
import { setupMouseControl } from './debug.js';
import PlayerController from './traits/PlayerController.js';
import { loadFont } from './loaders/font.js';
import { createDashboardLayer } from './layers/dashboard.js';

function createPlayerEnv(entity) {
  const playerEnv = new Entity();
  const playerControl = new PlayerController();
  playerControl.checkpoint.set(64, 64);
  playerControl.setPlayer(entity);
  playerEnv.addTrait(playerControl);
  return playerEnv;
}

async function main(canvas) {
  const context = canvas.getContext('2d');
  const audioContext = new AudioContext();
  
  const [entityFactory, font] = await Promise.all([
    loadEntities(audioContext),
    loadFont(),
  ]);

  const loadLevel = await createLevelLoader(entityFactory);
  
  const level = await loadLevel('1-1'); 
  
  const camera = new Camera();
  
  const mario = entityFactory.mario();

  const playerEnv = createPlayerEnv(mario);
  level.entities.add(playerEnv);

  level.comp.layers.push(createCollisionLayer(level));
  level.comp.layers.push(createDashboardLayer(font, playerEnv));
  
  const input = setupKeyboard(mario);
  input.listenTo(window);

  const gameContext = {
    audioContext,
    deltaTime: null,
  };
  
  const timer = new Timer(1/60);
  timer.update = function update(deltaTime) {
    gameContext.deltaTime = deltaTime;
    level.update(gameContext);
    
    camera.pos.x = Math.max(0, mario.pos.x - 100);
    
    level.comp.draw(context, camera);
  }
  
  timer.start();
}

const canvas = document.getElementById('screen');

const start = () => {
  window.removeEventListener('click', start);
  main(canvas);
}

window.addEventListener('click', start);