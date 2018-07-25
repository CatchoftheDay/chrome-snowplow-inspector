const hash = (bytes) => {
    let h = 5381;

    for (let i = 0; i < bytes.length; i++) {
        h = ((h << 5) + h) + bytes.charCodeAt(i);
    }

    return String(h);
};

const hasMembers = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    if (Array.isArray(obj) && obj.length > 0) {
        return true;
    }

    for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
            return true;
        }
    }

    return false;
};

const nameType = (val) => {
    if (val === null) {
        return 'null';
    }
    if (Array.isArray(val)) {
        return 'array';
    }
    if (typeof val === 'number' && isNaN(val)) {
        return 'number (NaN)';
    }
    if (typeof val === 'number' && !isFinite(val)) {
        return 'number (Infinite)';
    }
    if (val instanceof RegExp) {
        return 'RegExp';
    }
    if (val instanceof Date) {
        return 'Date';
    }
    if (val instanceof Promise) {
        return 'Promise';
    }
    return typeof val;
};

const copyToClipboard = (text) => {
    let cb = document.getElementById('clipboard') as HTMLInputElement;
    if (cb === null) {
        cb = document.createElement('input') as HTMLInputElement;
        cb.type = 'text';
        cb.id = 'clipboard';
        cb.style.position = 'relative';
        cb.style.left = '-10000px';
        document.body.appendChild(cb);
    }

    cb.value = typeof text === 'string' ? text : JSON.stringify(text);
    cb.select();
    document.execCommand('copy');
};

const tryb64 = (text: string): string => {
    if (typeof text === 'string' && /^([A-Za-z0-9/_+-]{4})+([A-Za-z0-9/_+=-]{1,4})?$/.test(text)) {
        return atob(text.replace(/_/g, '/').replace(/-/g, '+'));
    } else {
        return text;
    }
};

export = {hash, hasMembers, nameType, copyToClipboard, tryb64};
