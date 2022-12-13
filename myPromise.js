/**
 * myPromise
 * 代码参考：https://juejin.cn/post/6844903625769091079
 * 使用参考：https://es6.ruanyifeng.com/#docs/promise
 * 原生参考：https://github.com/stefanpenner/es6-promise
 */
class myPromise {
    constructor(executor) {
        this.status = 'pending';
        this.value = undefined;
        this.reason = undefined;

        this.resolveCallbacks = [];
        this.rejectCallbacks = [];

        const resolve = value => {
            if (this.status === 'pending') {
                this.value = value;
                this.status = 'fulfilled';
                this.resolveCallbacks.forEach(fn => fn())
            }
        }
        const reject = reason => {
            if (this.status === 'pending') {
                this.reason = reason;
                this.status = 'rejected';
                this.rejectCallbacks.forEach(fn => fn())
            }
        }

        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        throw Error('myPromise 存在循环引用的问题！');
    }
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        if (typeof x.then === 'function') {
            let called = false;
            try {
                x.then(y => {
                    if (called) { return }
                    called = true;
                    resolvePromise(promise2, y, resolve, reject);
                }, err => {
                    if (called) { return }
                    called = true;
                    reject(err);
                })
            } catch (e) {
                reject(e);
            }
        } else {
            resolve(x);
        }
    } else {
        resolve(x);
    }
}

// 实例方法：属于实例化类后对象的方法，即实例对象调用的方法。每创建一个类的实例，都会在内存中为非静态成员分配一块存储。
// 静态方法在一启动时就实例化了，因而静态内存是连续的，且静态内存是有限制的；非静态方法是在程序运行中生成内存的，申请的是离散的空间
// 【注意静态方法，不能使用箭头函数，不然this指向了window】
myPromise.prototype.then = function (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
    let promise2 = new myPromise((resolve, reject) => {
        if (this.status === 'fulfilled') {
            setTimeout(() => {
                try {
                    let y = onFulfilled(this.value);
                    resolvePromise(promise2, y, resolve, reject);
                } catch (err) {
                    onRejected(err);
                }
            }, 0)
        }
        if (this.status === 'rejected') {
            setTimeout(() => {
                try {
                    let y = onRejected(this.reason);
                    resolvePromise(promise2, y, resolve, reject);
                } catch (err) {
                    onRejected(err);
                }
            }, 0)
        }
        if (this.status === 'pending') {
            this.resolveCallbacks.push(() => {
                setTimeout(() => {
                    try {
                        let y = onFulfilled(this.value);
                        resolvePromise(promise2, y, resolve, reject);
                    } catch (err) {
                        onRejected(err);
                    }
                }, 0)
            })
            this.rejectCallbacks.push(() => {
                setTimeout(() => {
                    try {
                        let y = onRejected(this.reason);
                        resolvePromise(promise2, y, resolve, reject);
                    } catch (err) {
                        onRejected(err);
                    }
                }, 0)
            })
        }
    });
    return promise2;
}
myPromise.prototype.catch = function (onRejected) {
    this.then(null, onRejected)
}
myPromise.prototype.finally = function (callback) {
    return this.then(
        value => myPromise.resolve(callback()).then(() => value),
        reason => myPromise.resolve(callback()).then(() => reason),
    )
}

// 静态方法：属于类的方法及类可以直接调用的方法。为类所有实例化对象所共有(但不能用实例对象之间调用)，所以静态成员只在内存中占一块儿区域。
myPromise.resolve = function (value) {
    if (value instanceof myPromise) {
        return value;
    } else {
        return new myPromise((resolve, reject) => {
            resolve(value);
        })
    }
}
myPromise.reject = function (value) {
    if (value instanceof myPromise) {
        return value;
    } else {
        return new myPromise((resolve, reject) => {
            reject(value);
        })
    }
}
myPromise.race = function (arr) {
    if (!Array.isArray(arr)) {
        throw Error('arguments must be an Array!');
    }
    return new myPromise((resolve, reject) => {
        for (let i = 0; i < arr.length; i++) {
            myPromise.resolve(arr[i]).then(resolve, reject)
        }
    })
}
myPromise.all = function (arr) {
    if (!Array.isArray(arr)) {
        throw Error('arguments must be an Array!');
    }
    let count = 0;
    let result = [];
    return new myPromise((resolve, reject) => {
        for (let i = 0; i < arr.length; i++) {
            myPromise.resolve(arr[i]).then(res => {
                count++;
                result[i] = res;
                if (count === arr.length) {
                    resolve(result);
                }
            }, reject)
        }
    })
}
myPromise.any = function (arr) {
    if (!Array.isArray(arr)) {
        throw Error('arguments must be an Array!');
    }
    let count = 0;
    return new myPromise((resolve, reject) => {
        for (let i = 0; i < arr.length; i++) {
            myPromise.resolve(arr[i]).then(resolve, err => {
                count++;
                if (count === arr.length) {
                    reject('All promises were rejected');
                }
            })
        }
    })
}
myPromise.allSettled = function (arr) {
    if (!Array.isArray(arr)) {
        throw Error('arguments must be an Array!');
    }
    let count = 0;
    let result = [];
    return new myPromise((resolve, reject) => {
        for (let i = 0; i < arr.length; i++) {
            myPromise.resolve(arr[i]).then(value => {
                count++;
                result[i] = {
                    status: 'fulfilled',
                    value
                }
                if (count === arr.length) {
                    resolve(result);
                }
            }, reason => {
                count++;
                result[i] = {
                    status: 'rejected',
                    reason
                }
                if (count === arr.length) {
                    resolve(result);
                }
            })
        }
    })
}

function Co(generator) {
    if (Object.prototype.toString.call(generator) !== '[object GeneratorFunction]') {
        throw Error('arguments must be a genarator function!');
    }
    return new myPromise((resolve, reject) => {
        let gen = generator();
        let handle = data => {
            let { value, done } = gen.next(data);
            if (done) {
                resolve(value);
            } else {
                myPromise.resolve(value).then(res => {
                    handle(res);
                }, reject)
            }
        }
        handle();
    })
}

window.myPromise = myPromise;

// 加载图片
function loadImage(path) {
    return new myPromise((resolve, reject) => {
        const img = document.createElement('img');
        img.src = path;
        img.onload = function (value) {
            resolve(value);
        }
        img.onerror = function (reason) {
            reject(reason);
        }
        document.querySelectorAll('body')[0].appendChild(img);
    })
}

// 封装xhr
function getAjaxData({ url, type = "get" }) {
    return new myPromise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(url, type);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    reject(new Error(this.statusText));
                }
            }
        }
        xhr.responseType = 'json';
        xhr.setRequestHeader('from', 'myPromsie');
        xhr.setRequestHeader("Accept", "application/json")
        xhr.send();
    })
}

/*以下为测试******************************************************************************************************************************************************* */

console.log('myPromise---{}', myPromise.prototype);
console.log('原生的Promise---{}', Promise.prototype);

function a0() {
    return 0;
}
function a1() {
    return new myPromise((resolve, reject) => {
        setTimeout(() => {
            resolve(1)
        }, 1500)
    })
}
function a2() {
    return new myPromise((resolve, reject) => {
        setTimeout(() => {
            resolve(2)
        }, 500)
    })
}
function a3() {
    return new myPromise((resolve, reject) => {
        setTimeout(() => {
            resolve(3)
        }, 0)
    })
}
function a4() {
    return new myPromise((resolve, reject) => {
        resolve(4)
    })
}
function a5() {
    return new myPromise((resolve, reject) => {
        reject('5')
    })
}
function a6() {
    return new myPromise((resolve, reject) => {
        setTimeout(() => {
            reject('6')
        }, 0)
    })
}

function* getData() {
    let value0 = yield a0();
    console.log('value0------', value0);
    let value1 = yield a1();
    console.log('value1------', value1);
    let value2 = yield a2();
    console.log('value2------', value2);
    let value3 = yield a3();
    console.log('value3------', value3);
    let value4 = yield a4();
    console.log('value4------', value4);
    return [value0, value1, value2, value3, value4]
}

// 测试Co函数
Co(getData).then(res => {
    console.log('Co:res---{}', res);
}, err => {
    console.log('Co:err------{}', err);
})

// 对比async/await
async function getAsyncData() {
    let value0 = await a0();
    console.log('value0 await------', value0);
    let value1 = await a1();
    console.log('value1 await------', value1);
    let value2 = await a2();
    console.log('value2 await------', value2);
    let value3 = await a3();
    console.log('value3 await------', value3);
    let value4 = await a4();
    console.log('value4 await------', value4);
    return [value0, value1, value2, value3, value4]
}
getAsyncData().then(res => {
    console.log('async/await-----{}', res);
})

// 测试静态方法
myPromise.race([a1(), a2()]).then(res => {
    console.log('myPromise.race:', res);
})
Promise.race([a1(), a2()]).then(res => {
    console.log('原生Promise.race:', res);
})

/*********************************************************************** */
myPromise.any([a1(), a2(), a3()]).then(res => {
    console.log('myPromise.any:', res);
})
Promise.any([a1(), a2(), a3()]).then(res => {
    console.log('原生Promise.any:', res);
})

/************************************************************************ */
myPromise.all([a2(), a5()]).then(res => {
    console.log('myPromise.all:', res);
})
Promise.all([a2(), a5()]).then(res => {
    console.log('原生Promise.all:', res);
})

myPromise.all([a0(), a1(), a2()]).then(res => {
    console.log('myPromise.all:', res);
})
Promise.all([a0(), a1(), a2()]).then(res => {
    console.log('原生Promise.all:', res);
})

/*********************************************************************** */
myPromise.allSettled([a0(), a1(), a2(), a5(), a6()]).then(res => {
    console.log('myPromise.allSettled:', res);
})
Promise.allSettled([a0(), a1(), a2(), a5(), a6()]).then(res => {
    console.log('原生Promise.allSettled:', res);
})
