import {WebSocketServer, WebSocket} from "ws";
import {Game} from "../game/game";
import {validatePlayerEvent} from "../event/events.validators";

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
                if(!validatePlayerEvent(json)) {
                    return;
                }
                if(json.type === "reg") {
                    const event = this.game.registerPlayer(json.data.name, json.data.password);
                    if(!event.data.error) {
                        this.players.set(event.data.index, ws);
                        playerId = event.data.index;
                        ws.send(JSON.stringify(event));
                    }
                    else {
                        ws.send(JSON.stringify(event));
                    }
                }
                else if(playerId !== undefined) {
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