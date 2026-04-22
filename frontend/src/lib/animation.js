const CLIENT_COLOR = '#22C55E';

export function createClientState(lat, lon, key, region, count) {
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

export function updateAnimationStates(clients, now, dt) {
  for (let i = clients.length - 1; i >= 0; i--) {
    const c = clients[i];
    const age = now - c.createdAt;

    // Enter animation (300ms ease-out)
    if (c.enterProgress < 1) {
      c.enterProgress = Math.min(1, age / 300);
    }

    // Ripple phase (2s period)
    c.ripplePhase = (now / 2000) % 1;

    // Arc progress (starts 200ms after creation, 500ms to complete)
    if (age > 200 && c.arcProgress < 1) {
      c.arcProgress = Math.min(1, (age - 200) / 500);
    }

    // Flow phase (3s period)
    if (c.arcProgress >= 1) {
      c.flowPhase = (now / 3000) % 1;
    }

    // Exit animation (500ms)
    if (c.exiting) {
      c.exitProgress = Math.min(1, c.exitProgress + dt / 500);
      if (c.exitProgress >= 1) {
        clients.splice(i, 1);
      }
    }
  }
}
