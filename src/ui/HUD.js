import { LapSystem } from '../systems/LapSystem.js';

export class HUD {
  constructor() {
    this.hudElement = document.getElementById('hud');
    this.lapElement = document.getElementById('hud-lap');
    this.currentTimeElement = document.getElementById('hud-current-time');
    this.bestTimeElement = document.getElementById('hud-best-time');
    this.speedElement = document.getElementById('hud-speed');
    this.surfaceElement = document.getElementById('hud-surface');
  }

  show() {
    this.hudElement.classList.remove('hidden');
  }

  hide() {
    this.hudElement.classList.add('hidden');
  }

  update(car, lapSystem) {
    // Conversão proporcional de pixels/s para KM/H (1 px/s = aprox. 0.45 km/h)
    const kmh = Math.round(car.speed * 0.444);
    this.speedElement.innerHTML = `${kmh} <small>km/h</small>`;

    // Atualização de voltas e tempo
    this.lapElement.textContent = `${lapSystem.currentLap} / ${lapSystem.totalLaps}`;
    this.currentTimeElement.textContent = LapSystem.formatTime(lapSystem.currentLapTime);
    this.bestTimeElement.textContent = LapSystem.formatTime(lapSystem.bestLapTime);

    // Estado da superfície
    if (car.onTrack) {
      this.surfaceElement.textContent = "PISTA";
      this.surfaceElement.className = "value tag-track";
    } else {
      this.surfaceElement.textContent = "GRAMA";
      this.surfaceElement.className = "value tag-grass";
    }
  }
}
