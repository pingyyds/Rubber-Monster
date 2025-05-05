class CSlot {
    constructor() {
        this.data = {};
    }
    on(key, cb) {
        if (!this.data[key]) {
            this.data[key] = [];
        }
        this.data[key].push(cb);
        return cb;
    }
    off(key, cb) {
        if (!this.data[key]) {
            return;
        }
        if (cb == null) {
            if (this.data[key]) {
                delete this.data[key];
            }
        }
        else {
            let idx = this.data[key].indexOf(cb);
            if (idx != -1) {
                this.data[key].splice(idx, 1);
            }
        }
    }
    emit(key, ...data) {
        if (this.data[key]) {
            for (let cb of this.data[key]) {
                cb(...data);
            }
            // this.data[key](...data);
        }
    }
}
window.g_Slot = new CSlot();