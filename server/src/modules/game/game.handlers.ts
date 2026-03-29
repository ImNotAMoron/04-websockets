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
        for (const player of players) {
            eventCb(player, event);
        }
    };

    broadcastRoomEvent(event: GameEvent, room: Room) {
        const players = [...room.players, this.context.playersManager.getPlayer(room.hostId)!];
        const eventCb = this.context.playerEventCallback;
        if (!eventCb) {
            console.error("Callback or player is undefined");
            return;
        }
        for (const player of players) {
            eventCb(player, event);
        }
    }

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
            this.context.idByCode.set(room.code, room.id);
            this.context.rooms.set(room.id, room);
            this.broadcastEvent({
                type: "game_created",
                data: {
                    gameId: room.id,
                    code: room.code
                },
                id: 0,
            }, [host])
        });

        this.addHandler("join_game", (event, playerId) => {
            const player = context.playersManager.getPlayer(playerId);


            const code = this.context.idByCode.get(event.data.code) ?? "";
            const room = this.context.rooms.get(code);
            if (!room) throw "Room not found"
            const host = context.playersManager.getPlayer(room.hostId);
            if (!player) throw "Player not found";
            if (!host) throw "Host not found";
            player.score = 0;
            room.players.push(player);
            this.broadcastEvent({
                type: "game_joined",
                data: {
                    gameId: room.id,
                },
                id: 0,
            }, [player])
            // Таймауты необходимы для решения бага на клиенте, когда он не принимает часть ивентов
            setTimeout(() => {
                this.broadcastEvent({
                    type: "player_joined",
                    data: {
                        "playerName": player.name,
                        "playerCount": room.players.length,
                    },
                    id: 0,
                }, [...room.players, host])
            }, 100);
            setTimeout(() => {
                this.broadcastEvent({
                    type: "update_players",
                    data: room.players.map(player => {
                        return {
                            name: player.name,
                            index: player.id,
                            score: player.score
                        }
                    }),
                    id: 0,
                }, [...room.players, host])
            }, 200)
        });

        this.addHandler("start_game", (event, playerId) => {
            const room = this.context.rooms.get(event.data.gameId);
            if (!room) throw "Room not found";
            const host = this.context.playersManager.getPlayer(room.hostId)!;
            room.questionCallback = ((question) => {
                this.broadcastRoomEvent({
                    type: "question",
                    data: {
                        "questionNumber": room.currentQuestion,
                        "totalQuestions": room.questions.length,
                        "text": question.text,
                        "options": question.options,
                        "timeLimitSec": question.timeLimitSec
                    },
                    id: 0,
                }, room);
            })
            room.questionResultsCallback = ((result) => {
                this.broadcastRoomEvent({
                    type: "question_result",
                    data: result,
                    id: 0,
                }, room);
            })
            room.endGameCallback = (scoreboard) => {
                this.broadcastRoomEvent({
                    type: "game_finished",
                    data: {
                        scoreboard,
                    },
                    id: 0,
                }, room)
            }
            room.startGame()

        })
        this.addHandler("answer", (event, playerId) => {
            const room = this.context.rooms.get(event.data.gameId);
            if (!room) throw "Room not found";
            room.answer(playerId, event.data.answerIndex);
            this.broadcastRoomEvent({
                "type": "answer_accepted",
                "data": {
                    "questionIndex": room.currentQuestion,
                },
                "id": 0
            }, room)
        })
    }

    addHandler<T extends PlayerEventTypes>(type
                                           :
                                           T, callback
                                           :
                                           (event: Extract<PlayerEvent, {
                                               type: T
                                           }>, playerId: string) => void
    ) {
        this.handlers.set(type, (event: PlayerEvent, playerId: string) => {
            if (event.type !== type) throw new Error(`Event type is wrong`);
            callback(event as Extract<PlayerEvent, { type: T }>, playerId);
        });
    }

    handle(playerId
           :
           string, event
           :
           PlayerEvent
    ) {
        const fn = this.handlers.get(event.type);
        if (!fn) {
            this.log(`${event.type} doesn't have handler`)
            return;
        }
        this.log(`Processing ${event.type}`)
        try {
            fn(event, playerId);
        } catch (error) {
            this.log("Error processing ${event.type}");
            this.log(error);
        }
    }
}