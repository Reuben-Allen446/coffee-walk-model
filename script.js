// --- Coffee Presets --- //
const coffeePresets = {
    espresso: { fixed: true, default: { r_top: 0.045 / 2, r_bottom: 0.035 / 2, height: 0.06, volume: 0.06 } },
    double_espresso: { fixed: true, default: { r_top: 0.05 / 2, r_bottom: 0.04 / 2, height: 0.07, volume: 0.1 } },
    macchiato: { fixed: true, default: { r_top: 0.045 / 2, r_bottom: 0.035 / 2, height: 0.065, volume: 0.07 } },
    flat_white: {
      fixed: false,
      small: { r_top: 0.08 / 2, r_bottom: 0.06 / 2, height: 0.10, volume: 0.18 },
      medium: { r_top: 0.085 / 2, r_bottom: 0.065 / 2, height: 0.11, volume: 0.22 },
      large: { r_top: 0.09 / 2, r_bottom: 0.07 / 2, height: 0.12, volume: 0.26 }
    },
    cappuccino: {
      fixed: false,
      small: { r_top: 0.08 / 2, r_bottom: 0.06 / 2, height: 0.10, volume: 0.20 },
      medium: { r_top: 0.09 / 2, r_bottom: 0.07 / 2, height: 0.12, volume: 0.30 },
      large: { r_top: 0.10 / 2, r_bottom: 0.08 / 2, height: 0.14, volume: 0.38 }
    },
    latte: {
      fixed: false,
      small: { r_top: 0.09 / 2, r_bottom: 0.07 / 2, height: 0.13, volume: 0.28 },
      medium: { r_top: 0.10 / 2, r_bottom: 0.08 / 2, height: 0.15, volume: 0.35 },
      large: { r_top: 0.11 / 2, r_bottom: 0.09 / 2, height: 0.17, volume: 0.45 }
    },
    americano: {
      fixed: false,
      small: { r_top: 0.09 / 2, r_bottom: 0.07 / 2, height: 0.13, volume: 0.25 },
      medium: { r_top: 0.10 / 2, r_bottom: 0.08 / 2, height: 0.15, volume: 0.35 },
      large: { r_top: 0.11 / 2, r_bottom: 0.09 / 2, height: 0.17, volume: 0.45 }
    },
    mocha: {
      fixed: false,
      small: { r_top: 0.09 / 2, r_bottom: 0.07 / 2, height: 0.13, volume: 0.28 },
      medium: { r_top: 0.10 / 2, r_bottom: 0.08 / 2, height: 0.15, volume: 0.35 },
      large: { r_top: 0.11 / 2, r_bottom: 0.09 / 2, height: 0.17, volume: 0.45 }
    },
    hot_chocolate: {
      fixed: false,
      small: { r_top: 0.09 / 2, r_bottom: 0.07 / 2, height: 0.13, volume: 0.25 },
      medium: { r_top: 0.10 / 2, r_bottom: 0.08 / 2, height: 0.15, volume: 0.35 },
      large: { r_top: 0.11 / 2, r_bottom: 0.09 / 2, height: 0.17, volume: 0.45 }
    },
    chai_latte: {
      fixed: false,
      small: { r_top: 0.09 / 2, r_bottom: 0.07 / 2, height: 0.13, volume: 0.25 },
      medium: { r_top: 0.10 / 2, r_bottom: 0.08 / 2, height: 0.15, volume: 0.35 },
      large: { r_top: 0.11 / 2, r_bottom: 0.09 / 2, height: 0.17, volume: 0.45 }
    }
  };
  
  // --- Milk Ratios --- //
  const milkRatios = {
    latte: 0.7, cappuccino: 0.3, flat_white: 0.4,
    mocha: 0.5, chai_latte: 0.6, macchiato: 0.05,
    hot_chocolate: 0.9, espresso: 0, double_espresso: 0, americano: 0
  };
  
  // --- DOM Elements --- //
  const unitToggle = document.getElementById('unitToggle');
  const metricInputs = document.getElementById('metricInputs');
  const imperialInputs = document.getElementById('imperialInputs');
  const cupSizeSelect = document.querySelector('select[name="cupSize"]');
  const heightMetric = document.getElementById('heightMetric');
  const weightMetric = document.getElementById('weightMetric');
  const feetInput = document.getElementById('feet');
  const inchesInput = document.getElementById('inches');
  const stoneInput = document.getElementById('stone');
  const poundsInput = document.getElementById('pounds');
  
  // --- Toggle S/M/L dropdown visibility --- //
  document.querySelector('select[name="coffeeType"]').addEventListener('change', (e) => {
    const selected = e.target.value.toLowerCase().replace(" ", "_");
    const preset = coffeePresets[selected];
    cupSizeSelect.parentElement.classList.toggle('hidden', preset && preset.fixed);
    if (preset && preset.fixed) cupSizeSelect.value = ""; // prevent stuck input
  });
  
  // --- Unit toggle --- //
  unitToggle.addEventListener('change', () => {
    const isImperial = unitToggle.value === 'imperial';
    metricInputs.classList.toggle('hidden', isImperial);
    imperialInputs.classList.toggle('hidden', !isImperial);
    heightMetric.required = !isImperial;
    weightMetric.required = !isImperial;
    feetInput.required = isImperial;
    inchesInput.required = isImperial;
    stoneInput.required = isImperial;
    poundsInput.required = isImperial;
  });
  
  // --- Form Submit --- //
  document.getElementById('coffeeForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
  
    let height, weight;
    if (unitToggle.value === 'imperial') {
      const feet = parseFloat(feetInput.value) || 0;
      const inches = parseFloat(inchesInput.value) || 0;
      const stone = parseFloat(stoneInput.value) || 0;
      const pounds = parseFloat(poundsInput.value) || 0;
      height = ((feet * 12) + inches) * 2.54;
      weight = ((stone * 14) + pounds) * 0.453592;
    } else {
      height = parseFloat(heightMetric.value);
      weight = parseFloat(weightMetric.value);
    }
  
    const coffeeKey = userData.coffeeType.toLowerCase().replace(" ", "_");
    const sizeKey = userData.cupSize?.toLowerCase() || "default";
    const presetGroup = coffeePresets[coffeeKey];
    const milkRatio = milkRatios[coffeeKey] || 0;
  
    if (!presetGroup) return alert("Unknown coffee type.");
    const preset = presetGroup.fixed ? presetGroup.default : presetGroup[sizeKey];
    if (!preset) return alert("Please select a valid cup size.");
  
    const coffeeTemp = 90;
    const milkTemp = 60;
    const m_milk = milkRatio * preset.volume;
    const m_coffee = preset.volume - m_milk;
    const mixedTemp = (m_coffee * coffeeTemp + m_milk * milkTemp) / preset.volume;
  
    const presetInfo = document.getElementById("presetInfo");
    presetInfo.classList.remove("hidden");
    presetInfo.innerHTML = `
      <p><b>Drink:</b> ${userData.coffeeType} (${presetGroup.fixed ? "Fixed" : sizeKey.toUpperCase()})</p>
      <p>Volume: ${(preset.volume * 1000).toFixed(0)} ml</p>
      <p>Top Radius: ${(preset.r_top * 100).toFixed(1)} cm</p>
      <p>Assumed final mix temp: ${mixedTemp.toFixed(1)}°C</p>
    `;
  
    fetch('http://127.0.0.1:5000/calculate', {
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
        const resultBox = document.getElementById('result');
        resultBox.classList.remove('fade-pop');
        void resultBox.offsetWidth;
        resultBox.classList.remove('hidden');
        resultBox.classList.add('fade-pop');
        resultBox.innerHTML = `
          <p>Hello ${userData.name}!</p>
          <p>Your minimum walking speed to avoid spilling your <b>${userData.coffeeType}</b> with <b>${userData.milkType}</b> milk is:</p>
          <h2><b>${data.min_speed.toFixed(2)} m/s</b></h2>
          <p>Your drink cooled from <b>${mixedTemp.toFixed(1)}°C</b> to <b>${data.final_temp.toFixed(1)}°C</b> during the walk.</p>
          <p><i>(Converted height: ${height.toFixed(1)} cm, weight: ${weight.toFixed(1)} kg)</i></p>
          <p><small>Based on a 400 metre walk and initial drink temperature after milk mixing.</small></p>
          <hr>
          <p><b>About this model:</b><br>We modelled heat loss using Newton’s Law of Cooling and calculated spillage risk using liquid resonance theory — factoring in cup shape, volume, and movement.</p>
          <p style="font-size: 0.9em;">Group 1 – UOM General Physics Project</p>
        `;
  
        const chartCanvas = document.getElementById('coolingChart');
        chartCanvas.classList.remove('fade-pop');
        void chartCanvas.offsetWidth;
        chartCanvas.classList.remove('hidden');
        chartCanvas.classList.add('fade-pop');
  
        updateCoolingChart(data.time_values, data.temp_values);
      })
      .catch(err => {
        console.error("Backend error:", err);
        alert("Oops! Something went wrong with the calculation.");
      });
      document.getElementById('startTracking').classList.remove('hidden');
let minSpeed = data.min_speed;

  });
  
  // --- Cooling Chart Setup --- //
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
            borderWidth: 2,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.3,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
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
    const liveSpeedDisplay = document.getElementById('liveSpeed');
    const sloshMeter = document.getElementById('sloshMeter');
    sloshStatus.classList.remove('hidden');
  
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
  
          const dist = Math.sqrt(dx * dx + dy * dy) * 111139; // Convert to metres
          const speed = dist / dt;
  
          liveSpeedDisplay.textContent = speed.toFixed(2);
  
          // Slosh-o-meter visual
          const percent = Math.min((speed / minSpeed) * 100, 100);
          sloshMeter.style.width = `${percent}%`;
          sloshMeter.style.background = speed < minSpeed ? 'red' : 'limegreen';
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
  });
  if (speed < minSpeed) {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    // You could also play a beep sound here
  }
  document.getElementById('startTracking').addEventListener('click', () => {
    const sloshStatus = document.getElementById('sloshStatus');
    const liveSpeedDisplay = document.getElementById('liveSpeed');
    const tiltDisplay = document.getElementById('tiltAngle');
    const sloshMeter = document.getElementById('sloshMeter');
    const alertSound = document.getElementById('alertSound');
    sloshStatus.classList.remove('hidden');
  
    // --- 📍 GPS Tracking --- //
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
  
          const dist = Math.sqrt(dx * dx + dy * dy) * 111139; // metres
          const speed = dist / dt;
  
          liveSpeedDisplay.textContent = speed.toFixed(2);
  
          const fillPercent = Math.min((speed / minSpeed) * 100, 100);
          sloshMeter.style.width = `${fillPercent}%`;
          sloshMeter.style.background = speed < minSpeed ? 'red' : 'limegreen';
  
          if (speed < minSpeed) {
            if (navigator.vibrate) navigator.vibrate([100]);
            alertSound.play().catch(() => {}); // prevent autoplay block
          }
        }
  
        prevPos = currPos;
        prevTime = currTime;
      }, err => {
        alert("Could not track location.");
      }, {
        enableHighAccuracy: true,
        maximumAge: 1000
      });
    }
  
    // --- 📱 Accelerometer Tilt --- //
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", function (event) {
        const ax = event.accelerationIncludingGravity.x || 0;
        const ay = event.accelerationIncludingGravity.y || 0;
        const az = event.accelerationIncludingGravity.z || 0;
  
        // Angle of tilt from vertical
        const tilt = Math.acos(az / Math.sqrt(ax * ax + ay * ay + az * az)) * (180 / Math.PI);
        tiltDisplay.textContent = tilt.toFixed(1);
  
        // Optionally alert on high tilt
        if (tilt > 35) {
          if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
          alertSound.play().catch(() => {});
        }
      });
    } else {
      tiltDisplay.textContent = "Not supported";
    }
  });
  