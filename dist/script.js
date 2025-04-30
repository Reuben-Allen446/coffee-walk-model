console.log("script.js loaded & DOM is ready");

const form = document.getElementById("coffeeForm");
const presetInfo = document.getElementById("presetInfo");
const resultBox  = document.getElementById("result");
const startBtn   = document.getElementById("startTracking");
const sloshStat  = document.getElementById("sloshStatus");
const liveSpeed  = document.getElementById("liveSpeed");
const tiltAngle  = document.getElementById("tiltAngle");
const sloshMeter = document.getElementById("sloshMeter");
const alertSound = document.getElementById("alertSound");
const chartEl    = document.getElementById("coolingChart");

let minSpeed = 0, coolingChart;

// Initialize empty chart
function initChart() {
  const ctx = chartEl.getContext("2d");
  coolingChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Coffee Temperature (°C)",
        data: [],
        borderColor: "rgb(255,99,132)",
        borderWidth: 2,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Time (minutes)" } },
        y: { title: { display: true, text: "Temperature (°C)" }, min: 0, max: 100 }
      }
    }
  });
}

// Show temps on chart
function updateChart(times, temps) {
  chartEl.classList.remove("hidden");
  coolingChart.data.labels = times.map(t => t.toFixed(1));
  coolingChart.data.datasets[0].data = temps.map(t => t.toFixed(1));
  coolingChart.update();
}

// Form submit → call backend
form.addEventListener("submit", async e => {
  e.preventDefault();
  console.log("Form submitted");

  const d = Object.fromEntries(new FormData(form).entries());
  let h = parseFloat(d.height), w = parseFloat(d.weight);

  // build minimal payload (you can swap in your real preset logic)
  const payload = {
    T_initial: 90,
    r_top: 0.045/2, r_bottom: 0.035/2,
    height: 0.06, volume: 0.06,
    user_height: h, user_weight: w
  };

  try {
    const res = await fetch("https://coffee-walk-model.onrender.com/calculate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error(res.statusText);
    const data = await res.json();

    // preset & result panels
    presetInfo.classList.remove("hidden");
    presetInfo.innerHTML = `
      <p><b>Hello ${d.name}!</b></p>
      <p>Your min walking speed: <b>${data.min_speed.toFixed(2)} m/s</b></p>
      <p>Drink cooled from ${data.temp_values[0].toFixed(1)}°C to ${data.final_temp.toFixed(1)}°C.</p>
    `;
    resultBox.classList.remove("hidden"); // (reuse same div)
    resultBox.innerHTML = "";             // optional extra

    // store for slosh-o-meter
    minSpeed = data.min_speed;

    // init & show chart
    if(!coolingChart) initChart();
    updateChart(data.time_values, data.temp_values);

    // show Slosh button
    startBtn.classList.remove("hidden");
  } catch(err) {
    console.error("Calculation failed:", err);
    alert("Calculation failed. Try again.");
  }
});

// Slosh-o-meter
startBtn.addEventListener("click", () => {
  sloshStat.classList.remove("hidden");
  alertSound.play().catch(()=>{}); // beep on start

  if('geolocation' in navigator) {
    let prevPos, prevTime;
    navigator.geolocation.watchPosition(pos => {
      const now = Date.now(), c = pos.coords;
      if(prevPos) {
        const dt = (now - prevTime)/1000;
        const dx = (c.latitude  - prevPos.latitude)
                 , dy = (c.longitude - prevPos.longitude);
        const dist = Math.hypot(dx,dy) * 111139;
        const speed = dist/dt;
        liveSpeed.textContent = speed.toFixed(2);
        const pct = Math.min((speed/minSpeed)*100,100);
        sloshMeter.style.width = pct+"%";
        sloshMeter.style.background =
          speed < minSpeed ? "red" : "limegreen";
      }
      prevPos = c; prevTime = now;
    }, ()=>alert("Enable GPS!"), {enableHighAccuracy:true, maximumAge:1000});
  }

  if(window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", ev => {
      const {x,y,z} = ev.accelerationIncludingGravity;
      const tilt = Math.acos(z/Math.hypot(x,y,z))*(180/Math.PI);
      tiltAngle.textContent = tilt.toFixed(1);
      if(tilt>35) { navigator.vibrate?.([150]); alertSound.play().catch(()=>{}); }
    });
  }
});
