document.getElementById('startTracking').addEventListener('click', () => {
  const sloshStatus = document.getElementById('sloshStatus');
  const liveSpeedDisplay = document.getElementById('liveSpeed');
  const tiltDisplay = document.getElementById('tiltAngle');
  const sloshMeter = document.getElementById('sloshMeter');
  const alertSound = document.getElementById('alertSound');

  sloshStatus.classList.remove('hidden');

  let minSpeed = parseFloat(document.querySelector('#result h2 b')?.textContent) || 1.0;

  // --- GPS Tracking --- //
  if ('geolocation' in navigator) {
    let prevPos = null;
    let prevTime = null;

    navigator.geolocation.watchPosition(pos => {
      const currTime = Date.now();
      const currPos = pos.coords;

      if (prevPos && prevTime) {
        const dx = currPos.latitude - prevPos.latitude;
        const dy = currPos.longitude - prevPos.longitude;
        const dt = (currTime - prevTime) / 1000;

        const dist = Math.sqrt(dx * dx + dy * dy) * 111139;
        const speed = dist / dt;

        liveSpeedDisplay.textContent = speed.toFixed(2);

        const fill = Math.min((speed / minSpeed) * 100, 100);
        sloshMeter.style.width = `${fill}%`;
        sloshMeter.style.background = speed < minSpeed ? 'red' : 'limegreen';

        if (speed < minSpeed) {
          if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
          alertSound.play().catch(() => {});
        }
      }

      prevPos = currPos;
      prevTime = currTime;
    }, err => {
      alert("Could not track your movement. Enable GPS!");
    }, {
      enableHighAccuracy: true,
      maximumAge: 1000
    });
  } else {
    alert("Geolocation not supported on this device.");
  }

  // --- Accelerometer --- //
  if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", event => {
      const ax = event.accelerationIncludingGravity.x || 0;
      const ay = event.accelerationIncludingGravity.y || 0;
      const az = event.accelerationIncludingGravity.z || 0;

      const tilt = Math.acos(az / Math.sqrt(ax * ax + ay * ay + az * az)) * (180 / Math.PI);
      tiltDisplay.textContent = tilt.toFixed(1);

      if (tilt > 35) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        alertSound.play().catch(() => {});
      }
    });
  } else {
    tiltDisplay.textContent = "Tilt not supported.";
  }
});
