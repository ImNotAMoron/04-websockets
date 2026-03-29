export class GameLogger {
    enabled: boolean;
    log(...args: any[]) {
        if(!this.enabled) return;
        console.log(...args);
    }
    constructor(enabled: boolean) {
        this.enabled = enabled;
    }
}