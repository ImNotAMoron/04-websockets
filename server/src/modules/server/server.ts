import {WebSocketServer, WebSocket} from "ws";
import {Game} from "../game/game";
import {validateEvent} from "../event/events.validators";
import {validatePlayerEventReg} from "../event/client.events.types";

export class QuizServer {
    game: Game;
    players: Map<string, WebSocket>;
    ws: WebSocketServer;
    constructor(port: number, game: Game) {
        this.game = game;
        this.players = new Map();
        this.ws = new WebSocketServer({ port: port });
        this.ws.on("connection", (ws: WebSocket) => {
            let playerId: string | undefined = undefined;
            ws.on("message", (msg) => {
                const json = JSON.parse(msg.toString());
                if(validatePlayerEventReg(json)) {
                    const player = this.game.registerPlayer(json.data.name, json.data.password);
                    this.players.set(player.id, ws);
                    playerId = player.id;
                }
                else if(validateEvent(json) && playerId) {
                    this.game.handle(playerId, json);
                }
            })
        })
        this.game.onPlayerEvent(((player, event) => {
            const playerWs = this.players.get(player.id);
            if(!playerWs) return;
            playerWs.send(JSON.stringify(event));
        }));
    }
}