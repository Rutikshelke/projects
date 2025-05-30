const { execSync } = require('child_process');

const services = [
    'auth',
    'wallet',
    'contest',
    'scoring',
    'notification',
    'leaderboard',
    'analytics',
    'admin-service',
];

const clients = [
    'admin-panel',
    'landing-page-service',
]

const libs = [
    'auth-middleware',
    'error-handler',
    'logging'
]

services.forEach(service => {
    console.log(`Building ${service}...`);
    execSync(`cd services/${service} && npm install`, { stdio: 'inherit' });
});

libs.forEach(lib => {
    console.log(`Building ${lib}...`);
    execSync(`cd libs/${lib} && npm install`, { stdio: 'inherit' });
});

clients.forEach(client => {
    console.log(`Building ${client}...`);
    execSync(`cd clients/${client} && npm install`, { stdio: 'inherit' });
    execSync(`cd clients/${client} && npm run build`, { stdio: 'inherit' });
});