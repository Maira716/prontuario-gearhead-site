document.addEventListener('DOMContentLoaded', () => {
  initThemeSlider();
  initDynoCalculator();
  initPerformanceSimulator();
  initFlexCalculator();
  initDashboardCharts();
  initSmoothScroll();
});

// 1. SPLIT SLIDER MODO CLARO / ESCURO
function initThemeSlider() {
  const container = document.getElementById('theme-slider-container');
  const handle = document.getElementById('theme-slider-handle');
  const darkImage = document.getElementById('theme-slider-dark');
  
  if (!container || !handle || !darkImage) return;
  
  let isDragging = false;
  
  function setSliderPosition(x) {
    const rect = container.getBoundingClientRect();
    let position = ((x - rect.left) / rect.width) * 100;
    
    // Boundary check
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    
    // Update handle position
    handle.style.left = `${position}%`;
    
    // Update clip path on dark image (reveals light image underneath on the right side)
    // Dark image is on the left, so clip from 0 to position%
    darkImage.style.clipPath = `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`;
  }
  
  // Mouse events
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });
  
  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    setSliderPosition(e.clientX);
  });
  
  // Touch events for mobile responsiveness
  handle.addEventListener('touchstart', (e) => {
    isDragging = true;
  });
  
  window.addEventListener('touchend', () => {
    isDragging = false;
  });
  
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      setSliderPosition(e.touches[0].clientX);
    }
  });

  // Click on container also changes position
  container.addEventListener('click', (e) => {
    if (e.target !== handle && !handle.contains(e.target)) {
      setSliderPosition(e.clientX);
    }
  });
}

// 2. DINAMÔMETRO VIRTUAL
function initDynoCalculator() {
  // Input elements
  const tractionSelect = document.getElementById('dyno-traction');
  const stockHpInput = document.getElementById('dyno-stock-hp');
  const stockHpVal = document.getElementById('dyno-stock-hp-val');
  
  // Upgrades
  const upIntake = document.getElementById('up-intake');
  const upDownpipe = document.getElementById('up-downpipe');
  const upRemap = document.getElementById('up-remap');
  
  // Outputs
  const outEngineHp = document.getElementById('dyno-out-engine-hp');
  const outWhp = document.getElementById('dyno-out-whp');
  const outTorque = document.getElementById('dyno-out-torque');
  const outLoss = document.getElementById('dyno-out-loss');
  
  // Gauge and chart
  const gaugeNeedle = document.getElementById('dyno-gauge-needle');
  const dynoPathPower = document.getElementById('dyno-path-power');
  const dynoPathTorque = document.getElementById('dyno-path-torque');

  if (!stockHpInput || !outEngineHp) return;

  // Upgrade state
  let upgrades = {
    intake: false,
    downpipe: false,
    remap: false
  };

  // Toggle upgrades styling and state
  function setupUpgradeToggle(button, key) {
    button.addEventListener('click', () => {
      upgrades[key] = !upgrades[key];
      button.classList.toggle('btn-upgrade-active', upgrades[key]);
      
      // Update visual indicator checkmark/dot inside button if exists
      const indicator = button.querySelector('.upgrade-ind');
      if (indicator) {
        if (upgrades[key]) {
          indicator.classList.remove('bg-zinc-800');
          indicator.classList.add('bg-red-500');
        } else {
          indicator.classList.remove('bg-red-500');
          indicator.classList.add('bg-zinc-800');
        }
      }
      
      calculateDyno();
    });
  }

  setupUpgradeToggle(upIntake, 'intake');
  setupUpgradeToggle(upDownpipe, 'downpipe');
  setupUpgradeToggle(upRemap, 'remap');

  stockHpInput.addEventListener('input', () => {
    stockHpVal.textContent = stockHpInput.value + ' HP';
    calculateDyno();
  });

  tractionSelect.addEventListener('change', calculateDyno);

  function calculateDyno() {
    const stockHp = parseFloat(stockHpInput.value);
    const traction = tractionSelect.value;
    
    // Perdas de transmissão
    let lossPercentage = 0.12; // FWD
    if (traction === 'RWD') lossPercentage = 0.15;
    if (traction === 'AWD') lossPercentage = 0.20;
    
    // Ganhos estimados de modificações
    let multiplier = 1.0;
    if (upgrades.intake) multiplier += 0.05;     // +5% intake
    if (upgrades.downpipe) multiplier += 0.08;   // +8% escape
    if (upgrades.remap) multiplier += 0.15;      // +15% remap Stage 2

    // Se tiver Downpipe + Remap, dá um bônus de eficiência sinérgica
    if (upgrades.downpipe && upgrades.remap) {
      multiplier += 0.03; // combo bonus +3%
    }
    
    const engineHp = Math.round(stockHp * multiplier);
    const whp = Math.round(engineHp * (1 - lossPercentage));
    
    // Estimativa de Torque (Nm) baseada em uma proporção esportiva comum (1.35x HP original)
    // Turboalimentado comum de performance
    const torqueStock = stockHp * 1.35;
    const torque = Math.round(torqueStock * multiplier);
    const lossHp = engineHp - whp;

    // Update numbers in DOM
    animateNumber(outEngineHp, engineHp);
    animateNumber(outWhp, whp);
    animateNumber(outTorque, torque);
    outLoss.textContent = `-${Math.round(lossPercentage * 100)}% (${lossHp} HP perdidos em transmissão)`;
    
    // Update gauge pointer rotation (ranging from 0 to 600 HP maps to -120 to +120 degrees)
    const maxGaugeHp = 600;
    const percentageOfMax = Math.min(engineHp / maxGaugeHp, 1);
    const rotationDegrees = -120 + (percentageOfMax * 240);
    gaugeNeedle.style.transform = `rotate(${rotationDegrees}deg)`;
    
    // Update SVG charts paths dynamically
    updateChartPaths(engineHp, torque);
  }

  function updateChartPaths(maxPower, maxTorque) {
    if (!dynoPathPower || !dynoPathTorque) return;
    
    // Generate SVG path for power curve (reaches peak around 6000 RPM, then drops slightly)
    // X goes from 50 (1000 RPM) to 450 (7000 RPM)
    // Y represents HP (mapped to height 250 max, bottom is 250, top is 10)
    let powerPoints = [];
    let torquePoints = [];
    
    const rpmValues = [1000, 2000, 3000, 4000, 5000, 6000, 7000];
    
    // Multipliers for power curve at each RPM
    const powerCurveFactors = [0.15, 0.35, 0.60, 0.85, 0.98, 1.0, 0.90];
    const torqueCurveFactors = [0.60, 0.90, 1.0, 0.98, 0.90, 0.80, 0.65];
    
    const width = 400; // viewbox range is 0 to 450, mapping starts at 50
    const height = 240; // bottom Y is 240, top is 10
    
    for (let i = 0; i < rpmValues.length; i++) {
      const x = 50 + (i * (width / (rpmValues.length - 1)));
      
      const currentPower = maxPower * powerCurveFactors[i];
      const yPower = 240 - (currentPower / 600) * 220; // scaled to max 600hp
      powerPoints.push(`${x},${yPower}`);
      
      const currentTorque = maxTorque * torqueCurveFactors[i];
      const yTorque = 240 - (currentTorque / 800) * 220; // scaled to max 800Nm
      torquePoints.push(`${x},${yTorque}`);
    }
    
    // Convert to smooth cubic bezier command
    dynoPathPower.setAttribute('d', `M ${powerPoints.join(' L ')}`);
    dynoPathTorque.setAttribute('d', `M ${torquePoints.join(' L ')}`);
  }

  // Trigger initial calculation
  calculateDyno();
}

// 3. SIMULADOR FÍSICO DE PERFORMANCE (0-100 KM/H)
function initPerformanceSimulator() {
  const weightInput = document.getElementById('perf-weight');
  const weightVal = document.getElementById('perf-weight-val');
  const powerInput = document.getElementById('perf-power');
  const powerVal = document.getElementById('perf-power-val');
  const tractionSelect = document.getElementById('perf-traction');
  
  const outRatio = document.getElementById('perf-out-ratio');
  const outTime = document.getElementById('perf-out-time');
  const outSpeed = document.getElementById('perf-out-speed');
  
  const runBtn = document.getElementById('btn-run-sim');
  const progressBar = document.getElementById('sim-progress-bar');
  const simCar = document.getElementById('sim-car-icon');

  if (!weightInput || !runBtn) return;

  weightInput.addEventListener('input', () => {
    weightVal.textContent = weightInput.value + ' kg';
    updateSpecs();
  });

  powerInput.addEventListener('input', () => {
    powerVal.textContent = powerInput.value + ' HP';
    updateSpecs();
  });

  tractionSelect.addEventListener('change', updateSpecs);

  function getCalculatedStats() {
    const weight = parseFloat(weightInput.value);
    const power = parseFloat(powerInput.value);
    const traction = tractionSelect.value;
    
    const ratio = weight / power;
    
    // Formula: time = K * ratio^0.6
    let K = 1.7; // AWD
    if (traction === 'RWD') K = 1.85;
    if (traction === 'FWD') K = 2.1;
    
    let time = K * Math.pow(ratio, 0.6);
    
    // Adicionar limite físico mínimo (carros muito potentes sofrem por tração)
    const minPhysicalLimit = traction === 'AWD' ? 1.9 : traction === 'RWD' ? 2.5 : 3.4;
    if (time < minPhysicalLimit) {
      time = minPhysicalLimit + (time * 0.05); // amortecimento abaixo do limite físico
    }
    
    // Velocidade máxima teórica aproximada baseada na potência e peso (aerodinâmica padrão)
    // MaxSpeed = (Power^0.33) * 32 (aprox)
    let maxSpeed = Math.round(Math.pow(power, 0.33) * 33);
    // Ajustar pelo peso
    maxSpeed = Math.round(maxSpeed * (1500 / (1500 + (weight - 1500) * 0.2)));
    
    return {
      ratio: ratio.toFixed(2),
      time: time.toFixed(2),
      maxSpeed: Math.min(maxSpeed, 380) // cap at 380 km/h teoricamente
    };
  }

  function updateSpecs() {
    const stats = getCalculatedStats();
    outRatio.textContent = `${stats.ratio} kg/HP`;
    outTime.textContent = `${stats.time}s`;
    outSpeed.textContent = `${stats.maxSpeed} km/h`;
  }

  // Animating the simulation
  runBtn.addEventListener('click', () => {
    runBtn.disabled = true;
    runBtn.textContent = 'Acelerando... 🏎💨';
    
    progressBar.style.width = '0%';
    simCar.style.transform = 'translateX(0px)';
    
    const stats = getCalculatedStats();
    const duration = parseFloat(stats.time) * 1000; // scale animation to physical time
    
    let startTime = null;
    
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration * 100, 100);
      
      progressBar.style.width = `${percentage}%`;
      
      // Move car slightly forward
      const maxMove = 220; // max px
      simCar.style.transform = `translateX(${percentage / 100 * maxMove}px)`;
      
      // Shake effect to simulate speed
      if (percentage < 100) {
        const shake = (Math.random() - 0.5) * 3;
        simCar.style.transform += ` translateY(${shake}px)`;
        requestAnimationFrame(animate);
      } else {
        // Done
        runBtn.disabled = false;
        runBtn.textContent = 'Iniciar Arrancada ⏱️';
        simCar.style.transform = `translateX(${maxMove}px)`;
        
        // Add flash effect to time text
        outTime.classList.add('text-red-500', 'scale-110');
        setTimeout(() => {
          outTime.classList.remove('text-red-500', 'scale-110');
        }, 1000);
      }
    }
    
    requestAnimationFrame(animate);
  });

  updateSpecs();
}

// 4. CALCULADORA FLEX (ÁLCOOL VS GASOLINA)
function initFlexCalculator() {
  const priceGas = document.getElementById('flex-gas');
  const priceAlc = document.getElementById('flex-alc');
  
  const resultCard = document.getElementById('flex-result-card');
  const resultText = document.getElementById('flex-result-text');
  const resultDetail = document.getElementById('flex-result-detail');
  
  if (!priceGas || !priceAlc) return;

  function calculateFlex() {
    const gas = parseFloat(priceGas.value);
    const alc = parseFloat(priceAlc.value);
    
    if (isNaN(gas) || isNaN(alc) || gas <= 0 || alc <= 0) {
      resultText.textContent = 'Insira os valores';
      resultDetail.textContent = 'Preencha os campos para saber qual combustível compensa.';
      resultCard.className = 'mt-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-center transition-slow';
      return;
    }
    
    const ratio = alc / gas;
    const efficiencyThreshold = 0.70; // Álcool rende em média 70% da Gasolina
    
    if (ratio < efficiencyThreshold) {
      const savings = ((efficiencyThreshold - ratio) / efficiencyThreshold * 100).toFixed(1);
      resultText.textContent = 'Vá de ÁLCOOL! 🌽';
      resultDetail.textContent = `O álcool está custando ${(ratio * 100).toFixed(0)}% da gasolina. Economia estimada de aproximadamente ${savings}% por km rodado!`;
      resultCard.className = 'mt-6 p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-center transition-slow';
    } else {
      const difference = ((ratio - efficiencyThreshold) / efficiencyThreshold * 100).toFixed(1);
      resultText.textContent = 'Vá de GASOLINA! ⛽';
      resultDetail.textContent = `O álcool está custando ${(ratio * 100).toFixed(0)}% da gasolina. Utilizar gasolina é mais vantajoso por uma margem de ${difference}%.`;
      resultCard.className = 'mt-6 p-4 rounded-lg bg-orange-950/40 border border-orange-500/30 text-center transition-slow';
    }
  }

  priceGas.addEventListener('input', calculateFlex);
  priceAlc.addEventListener('input', calculateFlex);
}

// 5. ANIMATED NUMBERS HELPER
function animateNumber(element, targetValue) {
  const startValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
  if (startValue === targetValue) return;
  
  const duration = 800; // ms
  let startTimestamp = null;
  
  function step(timestamp) {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = Math.floor(progress * (targetValue - startValue) + startValue);
    
    element.textContent = currentValue;
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = targetValue;
    }
  }
  
  requestAnimationFrame(step);
}

// 6. DASHBOARD MOCK GRAPHS (SVG HEIGHTS ANIMATION)
function initDashboardCharts() {
  const bars = document.querySelectorAll('.dash-bar');
  if (bars.length === 0) return;
  
  // Animate SVG bar heights when dashboard section enters view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach(bar => {
          const targetHeight = bar.getAttribute('data-target-height');
          bar.style.height = `${targetHeight}%`;
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  const dashSection = document.querySelector('#insights-dashboard');
  if (dashSection) {
    observer.observe(dashSection);
  }
}

// 7. SMOOTH SCROLL
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
