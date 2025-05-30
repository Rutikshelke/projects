const { servers } = require('../configs/servers.json');
const axios = require('axios');
const { performance } = require('perf_hooks');
const { trackResponseTime } = require('../utils/responseTimer');

const fallback = async (req) => {
    for (let server of servers) {
        try {
            const response = await axios.get(`http://${server.host}:${server.port}${req.url}`);
            return response.data;
        } catch {
            continue;
        }
    }
    throw new Error('No available servers');
};

exports.proxyRequest = async (req) => {
    const best = servers.sort((a, b) => a.avgResponseTime - b.avgResponseTime)[0];
    const start = performance.now();

    try {
        const response = await axios.get(`http://${best.host}:${best.port}${req.url}`);
        const duration = performance.now() - start;
        trackResponseTime(best.port, duration);
        return response.data;
    } catch (err) {
        return await fallback(req);
    }
};
