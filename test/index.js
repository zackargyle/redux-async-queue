import chai from 'chai';
import queueMiddleware from '../src/index';

describe('queue middleware', () => {
    const doDispatch = () => {};
    const doGetState = () => {};
    const nextHandler = queueMiddleware({dispatch: doDispatch, getState: doGetState});

    it('must return a function to handle next', () => {
        chai.assert.isFunction(nextHandler);
        chai.assert.strictEqual(nextHandler.length, 1);
    });

    describe('handle action', () => {
        it('must run the given action function with next, dispatch and getState', done => {
            const actionHandler = nextHandler();
            actionHandler({
                queue: 'ARGUMENTS_TEST',
                callback: (next, dispatch, getState) => {
                    chai.assert.isFunction(next);
                    chai.assert.strictEqual(dispatch, doDispatch);
                    chai.assert.strictEqual(getState, doGetState);
                    done();
                },
            });
        });

        it('must pass action to next if no queue specified', done => {
            const actionObj = {};

            const actionHandler = nextHandler(action => {
                chai.assert.strictEqual(action, actionObj);
                done();
            });

            actionHandler(actionObj);
        });

        it('must return the return value of next if not a function', () => {
            const expected = 'redux';
            const actionHandler = nextHandler(() => expected);

            const outcome = actionHandler();
            chai.assert.strictEqual(outcome, expected);
        });

        it('must be invoked synchronously if queue is empty', () => {
            const actionHandler = nextHandler();
            let mutated = 0;

            actionHandler({
                queue: 'SYNC_TEST',
                callback: () => mutated++,
            });
            chai.assert.strictEqual(mutated, 1);
        });

        it('must be invoked asynchronously if queue is not empty', done => {
            const actionHandler = nextHandler();
            let mutated = 0;

            actionHandler({
                queue: 'ASYNC_TEST',
                callback: next => setTimeout(next, 0),
            });

            actionHandler({
                queue: 'ASYNC_TEST',
                callback: next => ++mutated && next(),
            });

            actionHandler({
                queue: 'ASYNC_TEST',
                callback: next => {
                    chai.assert.strictEqual(mutated, 1);
                    next();
                    done();
                },
            });
            chai.assert.strictEqual(mutated, 0);
        });
    });

    describe('handle errors', () => {
        it('must throw if argument is non-object', done => {
            try {
                queueMiddleware();
            } catch (err) {
                done();
            }
        });

        it('must throw if callback is non-function', done => {
            const actionHandler = nextHandler();
            try {
                actionHandler({
                    queue: 'CALLBACK_ERROR_TEST',
                });
            } catch (err) {
                done();
            }
        });
    });
});
