// test.js
const { getRandomPhilosopher } = require('./index');

const philosopher = getRandomPhilosopher();
console.log(`Name: ${philosopher.name}`);
console.log(`Intro: ${philosopher.intro}`);
