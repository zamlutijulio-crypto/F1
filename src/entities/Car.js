import { Vector2D } from '../physics/Vector2D.js';
import { PHYSICS_CONFIG, CAR_DIMENSIONS } from '../config/constants.js';

export class Car {
  constructor(x = 0, y = 0, angle = 0) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.angle = angle; // Ângulo de rotação em radianos
    this.angularVelocity = 0;
    this.speed = 0;     // Magnitude escalar de velocidade

    // Atributos de telemetria
    this.onTrack = true;
    this.isBraking = false;
    this.throttleRatio = 0;

    // Configurações do modelo visual (Equipe padrão Fase 1: Scuderia Red)
    this.color = "#e10600";
    this.accentColor = "#ffffff";
  }

  reset(x, y, angle) {
    this.position.set(x, y);
    this.velocity.set(0, 0);
    this.angle = angle;
    this.speed = 0;
    this.angularVelocity = 0;
    this.onTrack = true;
  }

  update(inputs, track, dt) {
    // 1. Verificação da superfície atual
    this.onTrack = track.isOnTrack(this.position);

    // 2. Coeficientes modificadores com base no terreno
    const maxSpeedModifier = this.onTrack ? 1.0 : PHYSICS_CONFIG.GRASS_SPEED_PENALTY;
    const dragModifier = this.onTrack ? 1.0 : PHYSICS_CONFIG.GRASS_DRAG_PENALTY;

    // 3. Processamento de entradas (Aceleração / Frenagem / Direção)
    let forwardForce = 0;
    this.isBraking = false;

    if (inputs.throttle) {
      forwardForce += PHYSICS_CONFIG.ACCELERATION;
      this.throttleRatio = 1;
    } else {
      this.throttleRatio = 0;
    }

    if (inputs.brake) {
      if (this.speed > 5) {
        // Freando em movimento para frente
        forwardForce -= PHYSICS_CONFIG.BRAKING_FORCE;
        this.isBraking = true;
      } else {
        // Marcha à ré
        forwardForce -= PHYSICS_CONFIG.ACCELERATION * 0.4;
      }
    }

    // 4. Dinâmica Direcional (apenas vira com o veículo em movimento)
    const turnFactor = Math.min(Math.abs(this.speed) / 120, 1.0);
    if (inputs.turnLeft) {
      this.angle -= PHYSICS_CONFIG.TURN_SPEED * turnFactor * dt;
    }
    if (inputs.turnRight) {
      this.angle += PHYSICS_CONFIG.TURN_SPEED * turnFactor * dt;
    }

    // 5. Vetores de orientação do veículo
    const forwardDirection = Vector2D.fromAngle(this.angle);
    const rightDirection = Vector2D.fromAngle(this.angle + Math.PI / 2);

    // 6. Resolução de Forças Físicas
    const forwardVelocity = forwardDirection.clone().multiply(this.velocity.dot(forwardDirection));
    const lateralVelocity = rightDirection.clone().multiply(this.velocity.dot(rightDirection));

    // Amortecimento lateral (grip mecânico)
    lateralVelocity.multiply(PHYSICS_CONFIG.LATERAL_FRICTION);

    // Recomposição do vetor velocidade
    this.velocity = forwardVelocity.add(lateralVelocity);

    // Adiciona impulso do motor
    this.velocity.add(forwardDirection.clone().multiply(forwardForce * dt));

    // Resistência aerodinâmica e rolagem
    const currentSpeed = this.velocity.magnitude();
    const airDrag = currentSpeed * currentSpeed * PHYSICS_CONFIG.DRAG_COEFFICIENT * dragModifier;
    const rollingResistance = PHYSICS_CONFIG.ROLLING_RESISTANCE * dragModifier;
    const totalResistance = (airDrag + rollingResistance) * dt;

    if (currentSpeed > totalResistance) {
      const dragVector = this.velocity.clone().normalize().multiply(-totalResistance);
      this.velocity.add(dragVector);
    } else {
      this.velocity.set(0, 0);
    }

    // Limitação de velocidade terminal
    const dynamicMaxSpeed = PHYSICS_CONFIG.MAX_SPEED * maxSpeedModifier;
    if (this.velocity.magnitude() > dynamicMaxSpeed) {
      this.velocity.normalize().multiply(dynamicMaxSpeed);
    }

    // 7. Integração de Posição
    this.position.add(this.velocity.clone().multiply(dt));
    this.speed = this.velocity.magnitude();
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    const w = CAR_DIMENSIONS.WIDTH;
    const h = CAR_DIMENSIONS.HEIGHT;

    // Sombra do carro
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);

    // Pneus (4 rodas independentes)
    ctx.fillStyle = "#111111";
    // Dianteiro Esquerdo / Direito
    ctx.fillRect(-w / 2 - 2, -h / 2 + 4, 4, 10);
    ctx.fillRect(w / 2 - 2, -h / 2 + 4, 4, 10);
    // Traseiro Esquerdo / Direito
    ctx.fillRect(-w / 2 - 3, h / 2 - 14, 5, 12);
    ctx.fillRect(w / 2 - 2, h / 2 - 14, 5, 12);

    // Chassi / Monocoque
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);                 // Bico dianteiro
    ctx.lineTo(w / 2 - 2, -h / 4);          // Suspensão dianteira dir.
    ctx.lineTo(w / 2 - 1, h / 4);           // Sidepod dir.
    ctx.lineTo(w / 2 - 3, h / 2 - 4);       // Traseira dir.
    ctx.lineTo(-w / 2 + 3, h / 2 - 4);      // Traseira esq.
    ctx.lineTo(-w / 2 + 1, h / 4);          // Sidepod esq.
    ctx.lineTo(-w / 2 + 2, -h / 4);         // Suspensão dianteira esq.
    ctx.closePath();
    ctx.fill();

    // Asa Dianteira
    ctx.fillStyle = "#2d3436";
    ctx.fillRect(-w / 2, -h / 2, w, 4);

    // Asa Traseira
    ctx.fillStyle = "#2d3436";
    ctx.fillRect(-w / 2 - 1, h / 2 - 6, w + 2, 5);

    // Cockpit / Piloto / Halo
    ctx.fillStyle = "#090d12";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Detalhe visual de luz de freio/ERS traseira
    if (this.isBraking) {
      ctx.fillStyle = "#ff1801";
      ctx.shadowColor = "#ff1801";
      ctx.shadowBlur = 8;
      ctx.fillRect(-2, h / 2 - 2, 4, 3);
      ctx.shadowBlur = 0; // Reset
    }

    ctx.restore();
  }
}
