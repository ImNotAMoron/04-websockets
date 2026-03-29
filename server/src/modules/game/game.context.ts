import {GamePlayer, PlayersManager} from "./game.player";
import {ServerEvent} from "../event/events.game.types";

export type PlayerEventCallback = (player: GamePlayer, event: ServerEvent) => void;
export type BroadcastEventCallback = (player: GamePlayer, event: ServerEvent) => void;
export type HandlerCallback = (player: GamePlayer, event: ServerEvent) => void;


export class GameContext {
    public playerEventCallback: PlayerEventCallback | undefined;
    public broadcastEventCallback: PlayerEventCallback | undefined;
    public playersManager: PlayersManager;
    constructor() {
        this.playersManager = new PlayersManager();
    }
}