console.log("script.js has loaded!");

let minSpeed = null; // Make this global so all parts of script can access it

document.getElementById('coffeeForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const userData = Object.fromEntries(formData.entries());

  let height, weight;
  const unitToggle = document.getElementById('unitToggle');
  if (unitToggle.value === 'imperial') {
    const feet = parseFloat(document.getElementById('feet').value) || 0;
    const inches = parseFloat(document.getElementById('inches').value) || 0;
    const stone = parseFloat(document.getElementById('stone').value) || 0;
    const pounds = parseFloat(document.getElementById('pounds').value) || 0;
    height = ((feet * 12) + inches) * 2.54;
    weight = ((stone * 14) + pounds) * 0.453592;
  } else {
    height = parseFloat(document.getElementById('heightMetric').value);
    weight = parseFloat(document.getElementById('weightMetric').value);
  }

  const coffeeKey = userData.coffeeType.toLowerCase().replace(" ", "_");
  const sizeKey = userData.cupSize?.toLowerCase() || "default";

  const coffeePresets = {
    espresso: { fixed: true, default: { r_top: 0.045 / 2, r_bottom: 0.035 / 2, height: 0.06, volume: 0.06 } },
    americano: { fixed: false, medium: { r_top: 0.10 / 2, r_bottom: 0.08 / 2, height: 0.15, volume: 0.35 } },
    latte: { fixed: false, medium: { r_top: 0.10 / 2, r_bottom: 0.08 / 2, height: 0.15, volume: 0.35 } }
  };

  const milkRatios = {
    espresso: 0, americano: 0, latte: 0.7
  };

  const presetGroup = coffeePresets[coffeeKey];
  const milkRatio = milkRatios[coffeeKey] || 0;
  if (!presetGroup) return alert("Unknown coffee type.");
  const preset = presetGroup.fixed ? presetGroup.default : presetGroup[sizeKey];
  if (!preset) return alert("Invalid cup size.");

  const coffeeTemp = 90;
  const milkTemp = 60;
  const m_milk = milkRatio * preset.volume;
  const m_coffee = preset.volume - m_milk;
  const mixedTemp = (m_coffee * coffeeTemp + m_milk * milkTemp) / preset.volume;

  fetch('https://coffee-walk-model.onrender.com/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      T_initial: mixedTemp,
      r_top: preset.r_top,
      r_bottom: preset.r_bottom,
      height: preset.height,
      volume: preset.volume,
      user_height: height,
      user_weight: weight
    })
  })
    .then(res => res.json())
    .then(data => {
      minSpeed = data.min_speed;

      document.getElementById('result').classList.remove('hidden');
      document.getElementById('result').innerHTML = `
        <p>Hello ${userData.name}!</p>
        <p>Your minimum walking speed is: <b>${minSpeed.toFixed(2)} m/s</b></p>
        <p>Drink cooled from <b>${mixedTemp.toFixed(1)}°C</b> to <b>${data.final_temp.toFixed(1)}°C</b>.</p>
      `;

      updateCoolingChart(data.time_values, data.temp_values);

      document.getElementById('startTracking').classList.remove('hidden');
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      alert("Calculation failed. Try again.");
    });
});

// Cooling Chart Setup
let coolingChart;
function updateCoolingChart(timeData, tempData) {
  const ctx = document.getElementById('coolingChart').getContext('2d');
  if (!coolingChart) {
    coolingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Coffee Temperature (°C)',
          data: [],
          borderColor: 'red',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Time (minutes)' } },
          y: { title: { display: true, text: 'Temperature (°C)' }, min: 0, max: 100 }
        }
      }
    });
  }

  coolingChart.data.labels = timeData.map(t => t.toFixed(1));
  coolingChart.data.datasets[0].data = tempData.map(t => t.toFixed(1));
  coolingChart.update();
}

document.getElementById('startTracking').addEventListener('click', () => {
  const sloshStatus = document.getElementById('sloshStatus');
  const speedDisplay = document.getElementById('liveSpeed');
  const tiltDisplay = document.getElementById('tiltAngle');
  const sloshBar = document.getElementById('sloshMeter');
  const alertSound = document.getElementById('alertSound');

  sloshStatus.classList.remove('hidden');

  if ('geolocation' in navigator) {
    let prev = null;
    navigator.geolocation.watchPosition(pos => {
      const now = Date.now();
      const coords = pos.coords;
      if (prev) {
        const dx = coords.latitude - prev.coords.latitude;
        const dy = coords.longitude - prev.coords.longitude;
        const dt = (now - prev.time) / 1000;
        const dist = Math.sqrt(dx * dx + dy * dy) * 111139;
        const speed = dist / dt;

        speedDisplay.textContent = speed.toFixed(2);
        const percent = Math.min((speed / minSpeed) * 100, 100);
        sloshBar.style.width = `${percent}%`;
        sloshBar.style.background = speed < minSpeed ? 'red' : 'limegreen';
        if (speed < minSpeed) alertSound.play().catch(() => {});
      }
      prev = { coords, time: now };
    }, err => alert("Location error"), { enableHighAccuracy: true });
  }

  if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", event => {
      const ax = event.accelerationIncludingGravity.x || 0;
      const ay = event.accelerationIncludingGravity.y || 0;
      const az = event.accelerationIncludingGravity.z || 0;
      const tilt = Math.acos(az / Math.sqrt(ax * ax + ay * ay + az * az)) * (180 / Math.PI);
      tiltDisplay.textContent = tilt.toFixed(1);
    });
  } else {
    tiltDisplay.textContent = "Not supported";
  }
});
