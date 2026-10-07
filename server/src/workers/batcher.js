class Batcher {
    constructor(flushFn, size, intervalMs) {
        this.flushFn = flushFn;
        this.size = size;
        this.intervalMs = intervalMs;
        this.items = [];
        this.waiters = [];
        this.timer = null        
    }

    add(item) {
        return new Promise((resolve, reject) => {
            this.items.push(item);
            this.waiters.push({resolve, reject})
            if (this.items.length >= this.size) {
                this.flush();
            } else if (!this.timer) {
                this.timer = setTimeout(() => this.flush(), this.intervalMs);
            }
        })
    }

    async flush() {
        clearTimeout(this.timer);
        this.timer = null
        if(this.items.length === 0) return;

        const items = this.items;
        const waiters = this.waiters;
        this.items = [];
        this.waiters = [];

        try{
            await this.flushFn(items);
            waiters.forEach((w) => w.resolve());            
        } catch (err) {
            waiters.forEach((w) => w.reject(err))
        }
    }
}

module.exports = Batcher