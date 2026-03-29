import {QuizServer} from "./modules/server/server";
import {Game} from "./modules/game/game";


const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server

const game = new Game();

void new QuizServer(PORT, game);