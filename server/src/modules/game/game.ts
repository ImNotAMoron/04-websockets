import {GamePlayer, PlayersManager} from "./game.player";
import {GameEvent} from "../event/events.base.types";
import {BroadcastEventCallback, GameContext, PlayerEventCallback} from "./game.context";
import {GameHandlers} from "./game.handlers";


export class Game {
    private context: GameContext
    private handlers: GameHandlers;
    registerPlayer(name: string, password: string): GamePlayer {
        return this.context.playersManager.authPlayer(name, password);
    }
    onPlayerEvent(cb: PlayerEventCallback): void {
        this.context.playerEventCallback = cb;
    }
    onBroadcastEvent(cb: BroadcastEventCallback): void {
        this.context.broadcastEventCallback = cb;
    }
    constructor() {
        this.context = new GameContext();
        this.handlers = new GameHandlers(this.context);
        setInterval(() => {
            if(this.context.playerEventCallback) {
                for(const player of this.context.playersManager.getAllPlayers()) {
                    this.context.playerEventCallback(player, {type: "msg", data: {message: `Hello, ${player.name}`}, id: 0})
                }
            }
        }, 1000)
    }
    handle(playerId: string, event: GameEvent<any, any>) {
        const player = this.context.playersManager.getPlayer(playerId);
        if(!player) throw "Player is undefined";
        const cb = this.handlers.handle(event.type);
        if(!cb) return;
        cb(player, event);
    }
}