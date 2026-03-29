import {GameContext} from "./game.context";
import {PlayerEvent, PlayerEventReg, PlayerEventTypes} from "../event/events.player.types";
import {Room} from "../room/room";
import {generateRandomCode} from "../../utils/generate-random-code";
import {GameEvent} from "../event/events.game.types";
import {GamePlayer} from "./game.player";

type PlayerEventMap = {
    [E in PlayerEvent as E['type']]: E
};

type PlayerHandlers = {
    [K in keyof PlayerEventMap]: (event: PlayerEventMap[K]) => void
};

export class GameHandlers {
    private handlers: Map<string, (event: PlayerEvent, playerId: string) => void> = new Map();
    private context: GameContext;
    // handlers: Record<(string extends PlayerEventTypes), string>;
    log: (...args: any[]) => void;

    broadcastEvent(event: GameEvent, players: GamePlayer[]) {
        const eventCb = this.context.playerEventCallback;
        if (!eventCb) {
            console.error("Callback or player is undefined");
            return;
        }
        for(const player of players) {
            eventCb(player, event);
        }
    };

    sendEvent(event: GameEvent, playerId: string) {
        const eventCb = this.context.playerEventCallback;
        const player = this.context.playersManager.getPlayer(playerId);
        if (!eventCb || !player) {
            console.error("Callback or player is undefined");
            return;
        }
        eventCb(player, event);
    };

    constructor(context: GameContext) {
        this.context = context;
        this.log = context.logger.log.bind(context);
        this.addHandler("create_game", (event, playerId) => {
            const host = context.playersManager.getPlayer(playerId);
            if (!host) throw "Player not found";
            const questions = event.data.questions;
            const room = new Room(questions, playerId);
            room.players.push(host);
            this.context.idByCode.set(room.code, room.id);
            this.context.rooms.set(room.id, new Room(questions, playerId));
            this.broadcastEvent({
                type: "game_created",
                data: {
                    gameId: room.id,
                    code: room.code
                },
                id: 0,
            }, room.players)
        });

        this.addHandler("join_game", (event, playerId) => {
            const player = context.playersManager.getPlayer(playerId);
            const code = this.context.idByCode.get(event.data.code) ?? "";
            const room = this.context.rooms.get(code);

            if (!room) throw "Room not found"
            const host = context.playersManager.getPlayer(room.hostId);
            if (!player) throw "Player not found";
            if(!host) throw "Host not found";
            room.players.push(player);
            this.broadcastEvent({
                type: "game_joined",
                data: {
                    gameId: room.id,
                },
                id: 0,
            }, [player])
            this.broadcastEvent({
                type: "player_joined",
                data: {
                    "playerName": player.name,
                    "playerCount": room.players.length,
                },
                id: 0,
            }, [...room.players, host])
            this.broadcastEvent({
                type: "update_players",
                data: room.players.map(player => {
                    return {
                        name: player.name,
                        index: player.id,
                        score: 0
                    }
                }),
                id: 0,
            }, [...room.players, host])
        });

        this.addHandler("start_game", (event, playerId) => {
            const roomId = this.context.idByCode.get(event.data.gameId);
            if(!roomId) throw "Room ID not found";
            const room = this.context.rooms.get(roomId)!;
            const host = this.context.playersManager.getPlayer(room.hostId)!;
            room.status = "in_progress";
            this.broadcastEvent({
                type: "game_created",
                data: {
                    name
                },
                id: 0,
            }, [...room.players, host.id])
        })
    }

    addHandler<T extends PlayerEventTypes>(type: T, callback: (event: Extract<PlayerEvent, {
        type: T
    }>, playerId: string) => void) {
        this.handlers.set(type, (event: PlayerEvent, playerId: string) => {
            if (event.type !== type) throw new Error(`Event type is wrong`);
            callback(event as Extract<PlayerEvent, { type: T }>, playerId);
        });
    }

    handle(playerId: string, event: PlayerEvent) {
        const fn = this.handlers.get(event.type);
        if (!fn) {
            this.log(`${event.type} doesn't have handler`)
            return;
        }
        this.log(`Processing ${event.type}`)
        try {
            fn(event, playerId);
        }
        catch (error) {
            this.log("Error processing ${event.type}");
            this.log(error);
        }
    }
}