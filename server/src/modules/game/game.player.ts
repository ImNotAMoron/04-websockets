export class GamePlayer {
    name: string;
    id: string;

    constructor(name: string) {
        this.name = name;
        this.id = crypto.randomUUID();
    }
}

export class PlayersManager {
    private players: Map<string, GamePlayer>;
    private credentialToId: Map<string, string>

    keyFromCredentials(name: string, password: string) {
        return `${name}\0${password}`;
    }

    constructor() {
        this.players = new Map();
        this.credentialToId = new Map();
    }

    getPlayer(id: string) {
        return this.players.get(id);
    }

    getPlayerByCredentials(name: string, password: string) {
        const key = this.keyFromCredentials(name, password);
        const id = this.credentialToId.get(key);
        if (!id) return undefined;
        return this.players.get(id);
    }

    authPlayer(name: string, password: string) {
        let player = this.getPlayerByCredentials(name, password);
        if (player) return player;
        else {
            const newPlayer = new GamePlayer(name);
            this.players.set(newPlayer.id, newPlayer);
            this.credentialToId.set(this.keyFromCredentials(name, password), newPlayer.id);
            return newPlayer;
        }
    }

    getAllPlayers() {
        return [...this.players.values()]
    }
}