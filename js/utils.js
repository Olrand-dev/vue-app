function successToast(msg, duration = 3200) {
    Vue.$toast.open({
        message: msg,
        type: 'success',
        position: 'bottom-right',
        duration: duration
    });
}

function infoToast(msg, duration = 3200) {
    Vue.$toast.open({
        message: msg,
        type: 'info',
        position: 'bottom-right',
        duration: duration
    });
}

function warningToast(msg, duration = 4200) {
    Vue.$toast.open({
        message: msg,
        type: 'warning',
        position: 'bottom-right',
        duration: duration
    });
}

function errorToast(msg, duration = 5000) {
    Vue.$toast.open({
        message: msg,
        type: 'error',
        position: 'bottom-right',
        duration: duration
    });
}


function getCurrentDateTime() {
    let now = new Date();

    let datetime = `${now.getDate().pad()}-${(now.getMonth()+1).pad()}-${now.getFullYear()}`;
    datetime += ` ${now.getHours().pad()}:${now.getMinutes().pad()}:${now.getSeconds().pad()}`;
    return datetime;
}

Number.prototype.pad = function(size) {
    let s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

function _round(num, precision) {
    let m = '1';
    for (let i = 0; i < precision; i++) {
        m += '0';
    }
    m = parseInt(m);

    return Math.round(num * m) / m;
}

function clone(obj, deep = false) {
    if (!isObject(obj)) return;

    return (deep) ? jQuery.extend(true, {}, obj) : jQuery.extend({}, obj);
}

function isObject(val, orFunction = false) {
    if (val === null) return false;
    return (orFunction) ? ((typeof val === 'function') || (typeof val === 'object')) : typeof val === 'object';
}

function hop(obj, prop) {
    if (!isObject(obj)) return false;
    return obj.hasOwnProperty(prop);
}

function objLength(obj) {
    return Object.keys(obj).length;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}