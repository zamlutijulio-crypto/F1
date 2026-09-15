import { GameEngine, GAME_STATES } from './game/GameEngine.js';
import { LapSystem } from './systems/LapSystem.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const engine = new GameEngine(canvas);

  // Telas da UI
  const mainMenu = document.getElementById('main-menu');
  const controlsScreen = document.getElementById('controls-screen');
  const recordsScreen = document.getElementById('records-screen');
  const resultsScreen = document.getElementById('results-screen');

  // Botões de navegação
  const btnStart = document.getElementById('btn-start');
  const btnControls = document.getElementById('btn-controls');
  const btnRecords = document.getElementById('btn-records');
  const btnBackControls = document.getElementById('btn-back-controls');
  const btnBackRecords = document.getElementById('btn-back-records');
  const btnRestart = document.getElementById('btn-restart');
  const btnResultsMenu = document.getElementById('btn-results-menu');

  // Iniciar corrida
  btnStart.addEventListener('click', () => {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    engine.startRace();
  });

  // Tela de Controles
  btnControls.addEventListener('click', () => {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    controlsScreen.classList.remove('hidden');
    controlsScreen.classList.add('active');
  });

  btnBackControls.addEventListener('click', () => {
    controlsScreen.classList.remove('active');
    controlsScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
  });

  // Tela de Recordes
  btnRecords.addEventListener('click', () => {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    recordsScreen.classList.remove('hidden');
    recordsScreen.classList.add('active');

    const recordsContainer = document.getElementById('records-list');
    const bestRecord = localStorage.getItem('apex_gp_best_lap');
    if (bestRecord) {
      recordsContainer.innerHTML = `<p>Recorde Pessoal: <strong>${LapSystem.formatTime(parseFloat(bestRecord))}</strong></p>`;
    } else {
      recordsContainer.innerHTML = `<p>Nenhum recorde registrado ainda.</p>`;
    }
  });

  btnBackRecords.addEventListener('click', () => {
    recordsScreen.classList.remove('active');
    recordsScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
  });

  // Fim de Prova
  btnRestart.addEventListener('click', () => {
    resultsScreen.classList.remove('active');
    resultsScreen.classList.add('hidden');
    engine.startRace();
  });

  btnResultsMenu.addEventListener('click', () => {
    resultsScreen.classList.remove('active');
    resultsScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    engine.state = GAME_STATES.MENU;
  });

  // Loop de Animação
  function gameLoop(timestamp) {
    engine.update(timestamp);
    engine.render();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
