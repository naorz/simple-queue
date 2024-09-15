const EventEmitter = require('events');
const queueEventEmitters = {};

// TODO: Replace the "events" lib with fancy queue lib

const getQueueEmitter = (queueName) => {
    if (!queueEventEmitters[queueName]) {
        queueEventEmitters[queueName] = new EventEmitter();
    }
    return queueEventEmitters[queueName];
};

const registerQueueListener = (queueName, callback) => {
    const emitter = getQueueEmitter(queueName);
    emitter.addListener('newMessage', callback);
};


const unregisterQueueListener = (queueName, callback, id) => {
    const emitter = getQueueEmitter(queueName);
    emitter.removeListener('newMessage', callback);
};


const notifyQueueListeners = (queueName) => {
    const emitter = getQueueEmitter(queueName);
    emitter.emit('newMessage');
};

module.exports = {
    registerQueueListener,
    unregisterQueueListener,
    notifyQueueListeners,
};
