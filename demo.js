// Simulated drive for previewing in a browser (index.html?demo). Not needed in-game.
(() => {
    let t = 0, speed = 0, fuel = 0.8, odo = 12345.6;
    setEngine(true); setHeadlights(1); setSeatbelts(true); setSpeedMode(0); setHealth(0.82);
    setInterval(() => {
        t += 0.1;
        const target = Math.max(0, 22 + 16 * Math.sin(t / 6) + 6 * Math.sin(t / 2.3)); // m/s
        speed += (target - speed) * 0.08;
        const kmh = speed * 3.6;
        const gear = kmh < 2 ? 0 : Math.min(6, 1 + Math.floor(kmh / 30));
        const rpm = gear ? 0.25 + 0.7 * Math.min(1, (kmh - (gear - 1) * 30) / 30) : 0.2;
        fuel = Math.max(0, fuel - 0.00005);
        odo += speed * 0.1 / 1609.344;
        setSpeed(speed); setRPM(rpm); setGear(gear); setFuel(fuel); setOdometer(odo);
        setLeftIndicator(Math.floor(t / 4) % 4 === 1);
        setRightIndicator(Math.floor(t / 4) % 4 === 3);
    }, 100);
})();
