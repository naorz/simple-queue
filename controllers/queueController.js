const createError = require('http-errors');
const { queues } = require('../models');
const { unregisterQueueListener, registerQueueListener, notifyQueueListeners } = require('../utils/events');


const DEFAULT_TIMEOUT_MS = 10;
const MIN_NETWORK_TIMEOUT_SEC = 3; // Add 5s to network timeout - thats the minimum to handle any network

const postMessage = (req, res) => {
    const { queue_name } = req.params;
    const message = req.body;

    if (!queue_name) {
        return res.status(createError.BadRequest()).json({ error: '"queue_name" is required' });
    }
    if (!message || String(message).length === 0) {
        return res.status(createError.BadRequest()).json({ error: 'body cannot be empty' });
    }

    queues.insertValueIntoQueue(queue_name, message);
    res.status(200).json({ message: 'Message added to queue' });
    notifyQueueListeners(queue_name);
};


const getMessage = (req, res) => {
    const {timeout = 0} = req.query;
    const { queue_name } = req.params;

    if (!queue_name) {
        return res.status(createError.BadRequest()).json({ error: '"queue_name" is required' });
    }

    const value = queues.getQueuedValue(queue_name);
    if (value) return res.status(200).json(value);

    // Once no value is found, we will wait for a new message to be added to the queue
    // handle network timeout
    const networkTimeout = parseInt(timeout, 10) + (MIN_NETWORK_TIMEOUT_SEC * 1000);
    console.log('🎸', '='.repeat(5), `no content, waiting to new message, networkTimeout`, networkTimeout);
    req.setTimeout(networkTimeout, () => {
        console.log('🎸', '='.repeat(5), `Network request timed out after ${networkTimeout}ms`);
        res.status(504).json({ error: 'Network timeout exceeded' });
    });

    let terminateListener = true;
    const callbackListener = () => {
        const value = queues.getQueuedValue(queue_name);
        if (!value) return; // keep waiting
        console.log('🎸', '='.repeat(5), `NEW MESSAGE, queue_name:`, queue_name, 'value', value);
        res.status(200).json(value);
        terminateListener = false;
        unregisterQueueListener(queue_name, callbackListener);
    }

    registerQueueListener(queue_name, callbackListener);
    console.log('🎸', '='.repeat(5), `registered, queue_name:`, queue_name);
    
    setTimeout(() => {
        console.log('🎸', '='.repeat(5), `timed out, queue_name:`, queue_name);
        if (!terminateListener) return;
        res.status(204).send();
        unregisterQueueListener(queue_name, callbackListener);
    }, networkTimeout - DEFAULT_TIMEOUT_MS);
};


module.exports = {
    postMessage,
    getMessage,
};
