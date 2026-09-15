import { CANVAS_CONFIG, PHYSICS_CONFIG, RACE_RULES } from '../config/constants.js';
import { Track } from '../entities/Track.js';
import { Car } from '../entities/Car.js';
import { InputHandler } from '../systems/InputHandler.js';
import { LapSystem } from '../systems/LapSystem.js';
import { HUD } from '../ui/HUD.js';

export const GAME_STATES = {
  MENU: 'MENU',
  RACING: 'RACING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED'
};

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });

    this.state = GAME_STATES.MENU;
    this.track = new Track();
    this.car = new Car();
    this.inputs = new InputHandler();
    this.lapSystem = new LapSystem(this.track, RACE_RULES.DEFAULT_TOTAL_LAPS);
    this.hud = new HUD();

    this.lastFrameTime = performance.now();
    this.physicsAccumulator = 0;

    this._setupCanvasSize();
    window.addEventListener('resize', () => this._setupCanvasSize());
  }

  _setupCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = CANVAS_CONFIG.INTERNAL_WIDTH * dpr;
    this.canvas.height = CANVAS_CONFIG.INTERNAL_HEIGHT * dpr;
    this.ctx.scale(dpr, dpr);
  }

  startRace() {
    const startPoint = this.track.getStartLine();
    this.car.reset(startPoint.position.x, startPoint.position.y, startPoint.angle);
    this.lapSystem.start();
    this.hud.show();
    this.state = GAME_STATES.RACING;
    this.lastFrameTime = performance.now();
    this.physicsAccumulator = 0;
  }

  update(timestamp) {
    const rawDelta = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    // Proteção contra saltos gigantes em suspensão de aba
    const dt = Math.min(rawDelta, 0.1);

    if (this.state === GAME_STATES.RACING) {
      this.physicsAccumulator += dt;

      // Execução em passos de tempo fixos (determinismo do modelo físico)
      while (this.physicsAccumulator >= PHYSICS_CONFIG.TIMESTEP) {
        this.car.update(this.inputs.keys, this.track, PHYSICS_CONFIG.TIMESTEP);
        this.lapSystem.update(this.car.position, PHYSICS_CONFIG.TIMESTEP);
        this.physicsAccumulator -= PHYSICS_CONFIG.TIMESTEP;

        if (this.inputs.keys.reset) {
          const startPoint = this.track.getStartLine();
          this.car.reset(startPoint.position.x, startPoint.position.y, startPoint.angle);
          this.inputs.keys.reset = false;
        }

        if (this.lapSystem.raceCompleted) {
          this._handleFinishRace();
          break;
        }
      }

      this.hud.update(this.car, this.lapSystem);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, CANVAS_CONFIG.INTERNAL_WIDTH, CANVAS_CONFIG.INTERNAL_HEIGHT);
    this.track.render(this.ctx);
    this.car.render(this.ctx);
  }

  _handleFinishRace() {
    this.state = GAME_STATES.FINISHED;
    this.hud.hide();

    const resultsScreen = document.getElementById('results-screen');
    document.getElementById('res-total-time').textContent = LapSystem.formatTime(this.lapSystem.totalElapsedTime);
    document.getElementById('res-best-lap').textContent = LapSystem.formatTime(this.lapSystem.bestLapTime);
    document.getElementById('res-laps-count').textContent = this.lapSystem.totalLaps;
    resultsScreen.classList.remove('hidden');
    resultsScreen.classList.add('active');
  }
}
