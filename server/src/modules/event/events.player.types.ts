export type PlayerEventReg = {
    type: "reg",
    data: {
        name: string,
        password: string,
    }
    id: number
}

export type PlayerEventCreateGame = {
    "type": "create_game",
    "data": {
        "questions": [
            {
                "text":  string
                "options": [string, string, string, string],
                "correctIndex": number,
                "timeLimitSec": number
            }
        ]
    },
    "id": number
}
export type PlayerEvent = PlayerEventReg | PlayerEventCreateGame;

export type PlayerEventTypes = PlayerEvent["type"];