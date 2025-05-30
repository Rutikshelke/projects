const concurrently = require('concurrently');

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
];

const commands = [
    ...services.map(service => ({
        command: `cd services/${service} && npm run dev`,
        name: service,
        prefixColor: 'cyan',
    })),
    ...clients.map(client => ({
        command: `cd clients/${client} && npm run dev`,
        name: client,
        prefixColor: 'magenta',
    }))
];

concurrently(commands, {
    prefix: 'name',
    killOthers: ['failure', 'success'],
});
