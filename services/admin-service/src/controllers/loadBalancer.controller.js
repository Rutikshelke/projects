const loadBalancerService = require('../services/loadBalancer.service');

exports.handleRequest = async (req, res) => {
    try {
        const response = await loadBalancerService.proxyRequest(req);
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send('All servers are busy.');
    }
};
