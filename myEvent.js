/**
 * EventBus
 */
class EventBus {
    constructor() {
        this.events = {};
    }
    on(name, fn) {
        if (!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].push(fn);
        return this;
    }
    emit(name, ...args) {
        let fns = this.events[name] || [];
        fns.forEach(fn => fn(...args));
        return this;
    }
    off(name, fn) {
        if (!fn) {
            this.events[name] = [];
        }
        this.events[name] = this.events[name].filter(item => item !== fn);
        return this;
    }
    once(name, fn) {
        const temp = (...args) => {
            fn(...args);
            this.off(name, fn);
        }
        this.on(name, temp);
        return this;
    }
}
