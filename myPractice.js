/**
 * 扁平化数组
 */
function flattenArr(arr) {
    if (!Array.isArray(arr)) {
        throw Error('arguments must be an Array!');
    }
    return arr.reduce((prev, item) => {
        if (Array.isArray(item)) {
            prev = [...prev, ...flattenArr(item)]
        } else {
            prev.push(item);
        }
        return prev;
    }, [])
}

/**
 * 树形扁平化一维数组
 */
function flatTreeToArr(treeArr) {
    if (!Array.isArray(arr)) {
        throw Error('arguments must be an Array!');
    }
    return treeArr.reduce((prev, item) => {
        let children = item.children || [];
        if (children.length) {
            prev = [...prev, ...flatTreeToArr(children)]
        } else {
            prev.push(item);
        }
        return prev;
    }, [])
}

/**
 * 一维数组变成tree
 */
/**
 * arr to tree
 */
function arrToTree(data) {
    if (!Array.isArray(data)) {
        return data;
    }
    let map = {};
    let result = [];
    data.forEach(item => {
        // 这里不能浅拷贝了 {...item}
        delete item.children;
        map[item.id] = item;
    })
    data.forEach(item => {
        let parent = map[item.pid];
        if (parent) {
            if (!parent.children) {
                parent.children = [];
            }
            parent.children.push(item);
        } else {
            result.push(item);
        }
    })

    console.log('result---------{}', result);
    return result;
}

var arrayData = [
    {
        id: 1,
        pid: 0
    },
    {
        id: 2,
        pid: 1
    },
    {
        id: 3,
        pid: 1
    },
    {
        id: 4,
        pid: 3
    },
    {
        id: 5,
        pid: 4
    },
    {
        id: 51,
        pid: 14
    },
    {
        id: 511,
        pid: 114
    }
]

arrToTree(arrayData);

/**
 * 深拷贝
 */
function deepClone(data) {
    if (data === null || typeof data !== 'object') {
        return data;
    }
    let result = Array.isArray(data) ? [] : {};
    Object.keys(data).forEach(key => {
        result[key] = deepClone(data[key]);
    });
    return result;
}
var a1 = {
    title: "11",
    a: [11, [22, [33, 11], [121]]],
    handle: () => { }
}
var b1 = deepClone(a1);
console.log('b1--{}', b1, a1 === b1);

/**
 * 节流
 */
function throttle(fn, delay) {
    let timer = null;
    return function () {
        const context = this;
        const args = arguments;
        if (timer) {
            return;
        }
        timer = setTimeout(() => {
            fn.apply(context, args);
            timer = null;
        }, delay)
    }
}

/**
 * 防抖
 */
function debounce(fn, delay) {
    let timer = null;
    return function () {
        let ctx = this;
        let args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(ctx, args);
        }, delay)
    }
}
