Redux Async Queue
=============

Async queue [middleware](http://redux.js.org/docs/advanced/Middleware.html) for Redux.

```
npm install --save redux-async-queue
```
If you used ES modules
```js
import ReduxAsyncQueue from 'redux-async-queue' // no changes here 😀
```
If you use CommonJS
```js
var ReduxAsyncQueue = require('redux-async-queue').default
```
If you need a UMD version
```js
var ReduxAsyncQueue = window.ReduxAsyncQueue.default
```

## What is it?

ReduxAsyncQueue [middleware](https://github.com/reactjs/redux/blob/master/docs/advanced/Middleware.md) makes queueing redux actions painless. This allows you to fire multiple actions simultaneously and have them execute asynchronously in order. 

The middleware will search for any action that has the `queue` property. It will then add the `callback` function to the corresponding queue. The `queue` key specifies to which queue this callback belongs. You may have several different queues for any given application.


For example, let's say we are making burgers (because they're delicious!). We can only make one burger at a time, but our friends keep coming up and saying they want one. You have 10 requests, but can only make one at a time. Here is how we'd write that delicious example out with the ReduxAsyncQueue middleware.

```js
// This is the name of the queue.  This does not need to match the action 'type' in 'makeBurger()'
// You could for example call this `MAKE_FOOD` if you were also going to be cooking up some
// sweet potato fries and wanted them in the same queue even though they are different actions.
const MAKE_BURGER = 'MAKE_BURGER';

function makeBurger(ingredients) {
  return {
    type: MAKE_BURGER,
    payload: ingredients,
  };
}

function queueMakeBurger(burgerStyle) {
  return {
    queue: MAKE_BURGER,
    callback: (next, dispatch, getState) => {
      getIngredients(burgerStyle).then(ingredients => {
        dispatch(makeBurger(ingredients));
        next();
      });
    }
  }
}

// Call the queue from your container / smart component
dispatch(queueMakeBurger(burgerStyle));
```

You'll notice the `next()` call within `callback`. That is the key to letting ReduxAsyncQueue know that you are ready to start making the next burger. If you do not call `next()` then the queue will not work.

## Installation
```
npm install --save redux-async-queue
```

To enable ReduxAsyncQueue, use [`applyMiddleware()`](http://redux.js.org/docs/api/applyMiddleware.html):

```js
import { createStore, applyMiddleware } from 'redux';
import ReduxAsyncQueue from 'redux-async-queue';
import reducer from './reducers/index';

const store = createStore(
  reducer,
  applyMiddleware(ReduxAsyncQueue)
);
```

## License

MIT
