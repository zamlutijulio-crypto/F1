export const CANVAS_CONFIG = {
  INTERNAL_WIDTH: 1920,
  INTERNAL_HEIGHT: 1080
};

export const PHYSICS_CONFIG = {
  TIMESTEP: 1 / 60,
  ACCELERATION: 480,       // px/s^2
  MAX_SPEED: 720,          // px/s (~320 km/h proporcional)
  BRAKING_FORCE: 820,      // px/s^2
  REVERSE_MAX_SPEED: 140,  // px/s
  TURN_SPEED: 3.4,         // radianos/s
  DRAG_COEFFICIENT: 0.0012,// Resistência do ar
  ROLLING_RESISTANCE: 35,  // Atrito de rolagem mecânico
  LATERAL_FRICTION: 0.86,  // Aderência lateral (anti-derrapagem)
  GRASS_SPEED_PENALTY: 0.38,// Multiplicador de velocidade máxima na grama
  GRASS_DRAG_PENALTY: 3.2   // Aumento de frenagem na grama
};

export const RACE_RULES = {
  DEFAULT_TOTAL_LAPS: 3
};

export const CAR_DIMENSIONS = {
  WIDTH: 22,
  HEIGHT: 44
};
