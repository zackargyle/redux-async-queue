function assertFunc(fn, message) {
    if (typeof fn !== 'function') {
        throw message;
    }
}

export default function queueMiddleware({ dispatch, getState }) {
    const queues = {};

    /**
     * This function executes the first function in
     * the queue at <key>. It provides a <next()> param
     * to the queued function to notify when to dequeue
     * the next queued function.
     *
     * @param {string} key - the key for the particular queue
     *
     * Callback params
     * @param {Function} next - notify when async action is finished
     * @param {Function} dispatch - allow dispatching of more actions
     * @param {Function} getState - allow state use within callback
     */
    function dequeue(key) {
        const callback = queues[key][0];
        callback(function next() {
            queues[key].shift();
            if (queues[key].length > 0) {
                dequeue(key);
            }
        }, dispatch, getState);
    }

    return next => action => {
        const { queue: key, callback } = action || {};
        if (key) {
            assertFunc(callback, 'Queued actions must have a <callback> property');
            // Verify array at <key>
            queues[key] = queues[key] || [];
            // Add new queued callback
            queues[key].push(callback);
            // If it's the only one, sync call it.
            if (queues[key].length === 1) {
                dequeue(key);
            }
        } else {
            return next(action);
        }
    };
}
