/**
 * myRedux
 * 实现一个简版的redux
 */
function createStore(prevState, reducer, enhancer) {
    if (typeof reducer !== 'function') {
        throw Error('reducer must be a function!')
    }
    if (typeof reducer === 'function' && typeof enhancer === 'function') {
        return enhancer(createStore)(prevState, reducer);
    }
    if (typeof prevState !== 'object' || prevState === null) {
        prevState = {};
    }
    let state = prevState || {};
    let listeners = [];
    let isDispatching = false;
    let isSubcribe = false;

    function getState() {
        return state;
    }

    function dispatch(action) {
        if (typeof action !== 'object' || action === null) {
            throw Error('action must be an object!');
        }
        if (!action.type) {
            throw Error('action must has a type!');
        }
        try {
            isDispatching = true;
            state = reducer(state, action)
        } finally {
            isDispatching = false;
        }
        listeners.forEach(fn => fn());
    }

    function subscribe(fn) {
        if (typeof fn !== 'function') {
            throw Error('fn must be a function!')
        }
        isSubcribe = true;
        listeners.push(fn);
        return function unsubscribe() {
            let index = listeners.findIndex(item => item === fn);
            listeners.splice(index, 1);
            isSubcribe = false;
        }
    }

    function randomString() {
        return Math.random().toString(36).substring(7).split('').join('-');
    }

    dispatch({
        type: "INIT_REDUX_" + randomString
    })

    return {
        getState,
        dispatch,
        subscribe
    }
}

function combineReducers(reducers) {
    if (Object.prototype.toString.call(reducers) !== '[object Object]') {
        throw Error('reducers must be an Object!');
    }
    let finalReducers = {};
    Object.keys(reducers).forEach(key => {
        if (typeof reducers[key] === 'function') {
            finalReducers[key] = reducers[key];
        }
    });
    return function combination(state, action) {
        let finalState = state || {};
        let isChanged = false;
        Object.keys(finalReducers).forEach(key => {
            let reducer = finalReducers[key];
            let prevState = finalState[key];
            let nextState = reducer(prevState, action);
            isChanged = prevState !== nextState || (Object.keys(prevState).length !== Object.keys(nextState).length);
            finalState[key] = nextState;
        })
        isChanged = Object.keys(state).length !== Object.keys(finalState).length;
        return isChanged ? finalState : state;
    }
}

function compose(fns) {
    if (fns.length === 0) {
        return arg => arg;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return fns.reduce((a, b) => (...args) => a(b(...args)));
}

function curry(fn) {
    let temp = (...arg1) => arg1.length === fn.length ? fn(...arg1) : (...arg2) => temp(...arg1, ...arg2);
    return temp;
}

function applyMiddleware(middlewares) {
    return (createStore) => {
        return (...args) => {
            const store = createStore(...args);
            let dispatch = () => { };
            const middlewareAPI = {
                getState: store.getState,
                dispatch: (...args) => store.dispatch(...args),
            }
            let chain = middlewares.map((middleware) => middleware(middlewareAPI));
            dispatch = compose(chain)(store.dispatch);

            return {
                ...store,
                dispatch
            }
        }
    }
}

function reduxThunk({ getState, dispatch }, ...args) {
    return next => {
        return action => {
            if (typeof action === 'function') {
                return action(getState, dispatch, ...args)
            }
            return next(action);
        }
    }
}
