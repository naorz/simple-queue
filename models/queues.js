const queues = {};

function getQueuedValue(queue_name) {
    if (!queue_name) {
        throw new Error('"queue_name" is required');
    }

    // TODO: handle default queue name
    if (!queues[queue_name] || queues[queue_name].length === 0) {
        return null;
    }

    console.log('🎸', '='.repeat(5), `<<<< get`, queue_name, queues[queue_name]);
    const value = queues[queue_name].shift();
    console.log('🎸', '='.repeat(5), `<<<< get`, queue_name, value, queues[queue_name]);
    return value;
}

function insertValueIntoQueue(queue_name, value) {
    if (!queue_name) {
        throw new Error('"queue_name" is required');
    }

    if (!queues[queue_name]) {
        queues[queue_name] = [];
    }

    queues[queue_name].push(value);
    console.log('🎸', '='.repeat(5), `>>>> post`, queue_name, queues[queue_name]);
}

module.exports = {getQueuedValue, insertValueIntoQueue};