import {GamePlayer, PlayersManager} from "./game.player";
import {GameLogger} from "./game.logger";
import {GameEvent} from "../event/events.game.types";
import {Room} from "../room/room";

export type PlayerEventCallback = (player: GamePlayer, event: GameEvent) => void;
export type BroadcastEventCallback = (event: GameEvent) => void;
export type HandlerCallback = (player: GamePlayer, event: GameEvent) => void;


export class GameContext {
    public logger: GameLogger;
    public rooms: Map<string, Room> = new Map();
    public idByCode: Map<string, string> = new Map();
    public playerEventCallback: PlayerEventCallback | undefined;
    public broadcastEventCallback: BroadcastEventCallback | undefined;
    public playersManager: PlayersManager;
    constructor(logger: GameLogger) {
        this.playersManager = new PlayersManager();
        this.logger = logger;
    }
}