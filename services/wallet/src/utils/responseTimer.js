const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../configs/servers.json');

exports.trackResponseTime = (port, responseTime) => {
    const config = JSON.parse(fs.readFileSync(filePath));
    const server = config.servers.find(s => s.port === port);

    server.avgResponseTime = server.avgResponseTime === 0
        ? responseTime
        : (server.avgResponseTime + responseTime) / 2;

    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
};
