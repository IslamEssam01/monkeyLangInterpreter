import type { ObjectInterface } from "./object";

export class Environment {
    store = new Map<string, ObjectInterface>();
    outer?: Environment;
    constructor(outer?: Environment) {
        this.outer = outer;
    }
    get(key: string): ObjectInterface | undefined {
        const val = this.store.get(key);
        if (!this.outer || val) return val;
        return this.outer.get(key);
    }
    set(key: string, val: ObjectInterface) {
        this.store.set(key, val);
        return val;
    }
}
