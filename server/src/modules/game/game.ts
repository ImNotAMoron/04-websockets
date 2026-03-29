import {GamePlayer} from "./game.player";
import {BroadcastEventCallback, GameContext, PlayerEventCallback} from "./game.context";
import {GameHandlers} from "./game.handlers";
import {PlayerEvent, PlayerEventReg} from "../event/events.player.types";
import {GameLogger} from "./game.logger"
import {GameEventReg} from "../event/events.game.types";


export class Game {
    private context: GameContext
    private handlers: GameHandlers;

    registerPlayer(name: string, password: string): GameEventReg {
        const player = this.context.playersManager.authPlayer(name, password);
        return {
                type: "reg",
                data: {
                    name: player.name,
                    index: player.id,
                    error: false,
                    errorText: ""
                },
                id: 0,
            }
    }

    onPlayerEvent(cb: PlayerEventCallback): void {
        this.context.playerEventCallback = cb;
    }

    onBroadcastEvent(cb: BroadcastEventCallback): void {
        this.context.broadcastEventCallback = cb;
    }

    constructor() {
        this.context = new GameContext(new GameLogger(false));
        this.handlers = new GameHandlers(this.context);
        // setInterval(() => {
        //     if (this.context.playerEventCallback) {
        //         for (const player of this.context.playersManager.getAllPlayers()) {
        //             this.context.playerEventCallback(player, {
        //                 type: "msg",
        //                 data: {message: `Hello, ${player.name}`},
        //                 id: 0
        //             })
        //         }
        //     }
        // }, 1000)
    }

    handle(playerId: string, event: PlayerEvent) {
        const player = this.context.playersManager.getPlayer(playerId);
        if (!player) throw "Player is undefined";
        this.handlers.handle(playerId, event);
    }
}