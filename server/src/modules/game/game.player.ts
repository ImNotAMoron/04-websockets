export class GamePlayer {
    name: string;
    id: string;
    score: number = 0;
    constructor(name: string) {
        this.name = name;
        this.id = crypto.randomUUID();
    }
}

export class PlayersManager {
    private players: Map<string, GamePlayer>;
    private credentialToId: Map<string, string>;
    private nameToId: Map<string, string>;

    keyFromCredentials(name: string, password: string) {
        return `${name}\0${password}`;
    }

    constructor() {
        this.players = new Map();
        this.credentialToId = new Map();
        this.nameToId = new Map();
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

    authPlayer(name: string, password: string): GamePlayer {
        const existingId = this.nameToId.get(name);
        if (existingId) {
            const player = this.getPlayerByCredentials(name, password);
            if (!player) throw new Error("Wrong password");
            return player;
        }
        const newPlayer = new GamePlayer(name);
        this.players.set(newPlayer.id, newPlayer);
        this.nameToId.set(name, newPlayer.id);
        this.credentialToId.set(this.keyFromCredentials(name, password), newPlayer.id);
        return newPlayer;
    }

    getAllPlayers() {
        return [...this.players.values()]
    }
}