export class InputHandler {
  constructor() {
    this.keys = {
      throttle: false,
      brake: false,
      turnLeft: false,
      turnRight: false,
      pause: false,
      reset: false
    };

    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup', (e) => this._onKeyUp(e));
  }

  _onKeyDown(e) {
    if (e.repeat) return;
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.throttle = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.brake = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.turnLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.turnRight = true;
        break;
      case 'KeyP':
        this.keys.pause = true;
        break;
      case 'KeyR':
        this.keys.reset = true;
        break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.throttle = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.brake = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.turnLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.turnRight = false;
        break;
      case 'KeyP':
        this.keys.pause = false;
        break;
      case 'KeyR':
        this.keys.reset = false;
        break;
    }
  }

  reset() {
    for (const key in this.keys) {
      this.keys[key] = false;
    }
  }
}
