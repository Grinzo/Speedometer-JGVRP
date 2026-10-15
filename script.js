let elements = {};
let speedMode = 0; // 0: KMH, 1: MPH, 2: Knots
let indicators = 0;
let lastSpeed = 0;
let lastOdometer = 0;

const MODES = [
    { unit: 'KMH',   speed: 3.6,      max: 240, odo: 1.609344, odoUnit: 'km' },
    { unit: 'MPH',   speed: 2.236936, max: 160, odo: 1,        odoUnit: 'mi' },
    { unit: 'Knots', speed: 1.943844, max: 140, odo: 0.868976, odoUnit: 'nmi' },
];
const mode = () => MODES[speedMode] || MODES[0];
const clamp = v => Math.min(1, Math.max(0, Number(v) || 0));
const onOrOff = state => state ? 'On' : 'Off';

function setArc(el, pct) {
    el.style.strokeDasharray = `${pct * 100} 100`;
    el.style.opacity = pct > 0.002 ? 1 : 0;
}

/** @param {boolean} state If true, the engine is on; otherwise, it is off. */
function setEngine(state) {
    elements.engine.innerText = onOrOff(state);
    elements.engineChip.dataset.on = String(!!state);
}

/** @param {number} speed - The speed value in meters per second (m/s). */
function setSpeed(speed) {
    lastSpeed = speed;
    const m = mode();
    const value = Math.round(speed * m.speed);
    const pct = clamp(value / m.max);
    elements.speed.innerText = value;
    elements.speedUnit.innerText = m.unit;
    elements.max.textContent = m.max;
    setArc(elements.speedArc, pct);
    elements.tip.style.transform = `rotate(${135 + 270 * pct}deg)`;
}

/** @param {number} rpm - The RPM value to display. (0 to 1). */
function setRPM(rpm) {
    elements.rpm.innerText = `${rpm.toFixed(4)} RPM`;
    setArc(elements.rpmArc, clamp(rpm));
    elements.gauge.classList.toggle('redline', rpm > 0.85);
}

/** @param {number} fuel - The fuel level (0 to 1). */
function setFuel(fuel) {
    elements.fuel.innerText = `${(fuel * 100).toFixed(0)}%`;
    elements.fuelBar.style.width = `${clamp(fuel) * 100}%`;
    elements.fuelMeter.classList.toggle('low', fuel < 0.15);
}

/** @param {number} health - The vehicle health level (0 to 1). */
function setHealth(health) {
    elements.health.innerText = `${(health * 100).toFixed(0)}%`;
    elements.healthBar.style.width = `${clamp(health) * 100}%`;
    elements.healthMeter.classList.toggle('low', health < 0.25);
}

/** @param {number|string} gear - The current gear. 0 is shown as N (neutral/reverse). */
function setGear(gear) {
    elements.gear.innerText = gear === 0 ? 'N' : String(gear);
}

/** @param {number} state - The headlight state (0: Off, 1: On, 2: High Beam). */
function setHeadlights(state) {
    const s = state === 1 || state === 2 ? state : 0;
    elements.headlights.dataset.state = s;
    elements.headlights.title = 'Headlights: ' + ['Off', 'On', 'High Beam'][s];
}

function renderIndicators() {
    elements.indLeft.classList.toggle('on', !!(indicators & 0b01));
    elements.indRight.classList.toggle('on', !!(indicators & 0b10));
}

/** @param {boolean} state - If true, turns the left indicator on; otherwise, turns it off. */
function setLeftIndicator(state) {
    indicators = (indicators & 0b10) | (state ? 0b01 : 0b00);
    renderIndicators();
}

/** @param {boolean} state - If true, turns the right indicator on; otherwise, turns it off. */
function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
    renderIndicators();
}

/** @param {boolean} state - If true, indicates seatbelts are fastened; otherwise, indicates they are not. */
function setSeatbelts(state) {
    elements.seatbelts.dataset.on = String(!!state);
    elements.seatbelts.title = 'Seatbelts: ' + onOrOff(state);
}

/** @param {number} mode - The speed mode to set (0: KMH, 1: MPH, 2: Knots). */
function setSpeedMode(newMode) {
    speedMode = newMode;
    setSpeed(lastSpeed);
    setOdometer(lastOdometer);
}

/** @param {number} distance - The distance in miles (shown in km / mi / nmi following the speed mode). */
function setOdometer(distance) {
    lastOdometer = distance;
    const m = mode();
    elements.odometer.innerText = `${(distance * m.odo).toFixed(1)} ${m.odoUnit}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    elements = {
        engine: $('engine'), engineChip: $('engine-chip'),
        speed: $('speed'), speedUnit: $('speed-unit'), speedArc: $('speed-arc'), tip: $('tip'), max: $('max'),
        gauge: $('gauge'), rpm: $('rpm'), rpmArc: $('rpm-arc'),
        fuel: $('fuel'), fuelBar: $('fuel-bar'), fuelMeter: $('fuel-meter'),
        health: $('health'), healthBar: $('health-bar'), healthMeter: $('health-meter'),
        gear: $('gear'), headlights: $('headlights'), seatbelts: $('seatbelts'),
        indLeft: $('ind-left'), indRight: $('ind-right'), odometer: $('odometer'),
    };
    setEngine(false); setSpeed(0); setRPM(0); setFuel(1); setHealth(1);
    setGear(0); setHeadlights(0); setSeatbelts(false); setOdometer(0);

    // Preview in a normal browser: open index.html?demo
    if (new URLSearchParams(location.search).has('demo')) {
        const s = document.createElement('script');
        s.src = 'demo.js';
        document.body.appendChild(s);
    }
});
