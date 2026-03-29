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
        "questions":
            {
                "text":  string
                "options": [string, string, string, string],
                "correctIndex": number,
                "timeLimitSec": number
            }[]

    },
    "id": number
}

export type PlayerEventJoinGame = {
    "type": "join_game",
    "data": {
        "code": string,
    },
    "id": 0
}

export type PlayerEventStartGame = {
    "type": "start_game",
    "data": {
        "gameId": string
    },
    "id": 0
}

export type PlayerEventSubmitAnswer = {
    "type": "answer",
    "data": {
        "gameId": string,
        "questionIndex": number,
        "answerIndex": number
    },
    "id": 0
}

export type PlayerEvent = PlayerEventReg | PlayerEventCreateGame | PlayerEventStartGame | PlayerEventJoinGame | PlayerEventSubmitAnswer;

export type PlayerEventTypes = PlayerEvent["type"];