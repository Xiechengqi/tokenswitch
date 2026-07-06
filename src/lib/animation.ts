const CLIENT_COLOR = "#22c55e";

export interface ClientAnimState {
  key: string;
  lat: number;
  lon: number;
  region: string;
  count: number;
  color: string;
  createdAt: number;
  enterProgress: number;
  ripplePhase: number;
  arcProgress: number;
  flowPhase: number;
  exiting: boolean;
  exitProgress: number;
}

export function createClientState(
  lat: number,
  lon: number,
  key: string,
  region: string,
  count: number,
): ClientAnimState {
  return {
    key,
    lat,
    lon,
    region,
    count,
    color: CLIENT_COLOR,
    createdAt: performance.now(),
    enterProgress: 0,
    ripplePhase: Math.random() * Math.PI * 2,
    arcProgress: 0,
    flowPhase: Math.random(),
    exiting: false,
    exitProgress: 0,
  };
}

export function updateAnimationStates(clients: ClientAnimState[], now: number, dt: number) {
  for (let i = clients.length - 1; i >= 0; i--) {
    const c = clients[i];
    const age = now - c.createdAt;

    if (c.enterProgress < 1) {
      c.enterProgress = Math.min(1, age / 300);
    }

    c.ripplePhase = (now / 2000) % 1;

    if (age > 200 && c.arcProgress < 1) {
      c.arcProgress = Math.min(1, (age - 200) / 500);
    }

    if (c.arcProgress >= 1) {
      c.flowPhase = (now / 3000) % 1;
    }

    if (c.exiting) {
      c.exitProgress = Math.min(1, c.exitProgress + dt / 500);
      if (c.exitProgress >= 1) {
        clients.splice(i, 1);
      }
    }
  }
}
