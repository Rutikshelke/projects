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

services.forEach(service => {
    console.log(`Building ${service}...`);
    execSync(`cd services/${service} && npm run build`, { stdio: 'inherit' });
});
