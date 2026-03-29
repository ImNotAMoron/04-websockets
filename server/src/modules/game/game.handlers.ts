import {GameContext} from "./game.context";
import {PlayerEvent, PlayerEventReg, PlayerEventTypes} from "../event/events.player.types";

type PlayerEventMap = {
    [E in PlayerEvent as E['type']]: E
};

type PlayerHandlers = {
    [K in keyof PlayerEventMap]: (event: PlayerEventMap[K]) => void
};

export class GameHandlers {
    private handlers: Partial<PlayerHandlers> = {};
    private context: GameContext;
    // handlers: Record<(string extends PlayerEventTypes), string>;
    constructor(context: GameContext) {
        this.context = context;
        this.addHandler("reg", (event) => {

        });
    }
    addHandler<T extends PlayerEventTypes>(type: T, callback: (event: Extract<PlayerEvent, {type: T}>) => void) {
        this.handlers[type] = (event: PlayerEvent) => {
            if(event.type !== type) throw new Error(`Event type is wrong`);
            callback(event as Extract<PlayerEvent, {type: T}>);
        };
    }
    handle(event: PlayerEvent) {
        const fn = this.handlers[event.type];
        if(!fn) {
            console.warn(`${event.type} doesn't have handler`);
            return;
        }
        fn(event);
    }
}