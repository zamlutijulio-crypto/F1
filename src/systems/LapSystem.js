export class LapSystem {
  constructor(track, totalLaps = 3) {
    this.track = track;
    this.totalLaps = totalLaps;

    this.currentLap = 1;
    this.nextGateIndex = 1;
    this.lapStartTime = 0;
    this.currentLapTime = 0;
    this.bestLapTime = null;
    this.totalElapsedTime = 0;
    this.lapHistory = [];
    this.raceCompleted = false;

    this.previousPosition = null;
  }

  start() {
    const now = performance.now();
    this.lapStartTime = now;
    this.currentLapTime = 0;
    this.totalElapsedTime = 0;
    this.currentLap = 1;
    this.nextGateIndex = 1;
    this.raceCompleted = false;
    this.lapHistory = [];
    this.bestLapTime = null;
  }

  update(carPosition, dt) {
    if (this.raceCompleted) return;

    this.currentLapTime += dt * 1000;
    this.totalElapsedTime += dt * 1000;

    if (!this.previousPosition) {
      this.previousPosition = carPosition.clone();
      return;
    }

    // Verificação de travessia do próximo gate esperado
    const targetGate = this.track.gates[this.nextGateIndex];
    if (this._hasCrossedLine(this.previousPosition, carPosition, targetGate.p1, targetGate.p2)) {
      if (this.nextGateIndex === 0) {
        // Completou a volta
        this._completeLap();
      } else {
        // Avança para o próximo checkpoint
        this.nextGateIndex = (this.nextGateIndex + 1) % this.track.gates.length;
      }
    }

    this.previousPosition.set(carPosition.x, carPosition.y);
  }

  _completeLap() {
    const recordedTime = this.currentLapTime;
    this.lapHistory.push(recordedTime);

    if (this.bestLapTime === null || recordedTime < this.bestLapTime) {
      this.bestLapTime = recordedTime;
      this._saveLocalRecord(recordedTime);
    }

    if (this.currentLap >= this.totalLaps) {
      this.raceCompleted = true;
    } else {
      this.currentLap++;
      this.currentLapTime = 0;
      this.nextGateIndex = 1;
    }
  }

  _saveLocalRecord(timeMs) {
    try {
      const saved = localStorage.getItem('apex_gp_best_lap');
      if (!saved || timeMs < parseFloat(saved)) {
        localStorage.setItem('apex_gp_best_lap', timeMs.toString());
      }
    } catch (e) {
      console.warn("Armazenamento local indisponível:", e);
    }
  }

  _hasCrossedLine(p1, p2, l1, l2) {
    function ccw(A, B, C) {
      return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    }
    return (ccw(p1, l1, l2) !== ccw(p2, l1, l2)) && (ccw(p1, p2, l1) !== ccw(p1, p2, l2));
  }

  static formatTime(ms) {
    if (!ms || isNaN(ms)) return "--:--.---";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }
}
