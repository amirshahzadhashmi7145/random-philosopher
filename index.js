// index.js
const philosophers = require('./philosophers');

function getRandomPhilosopher() {
    const randomIndex = Math.floor(Math.random() * philosophers.length);
    return philosophers[randomIndex];
}

module.exports = { getRandomPhilosopher };

