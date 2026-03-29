export type GameEventReg = {
    "type": "reg",
    "data": {
        "name": string,
        "index": string,
        "error": false,
        "errorText": string
    },
    id: number,
}

export type GameEventCreateGame = {
    "type": "game_created",
    "data": {
        "gameId": string,
        "code": string
    },
    "id": 0
}

export type GameEventGameJoined = {
    "type": "game_joined",
    "data": {
        "gameId": string
    },
    "id": 0
}

export type GameEventPlayerJoined = {
    "type": "player_joined",
    "data": {
        "playerName": string,
        "playerCount": number
    },
    "id": 0
}

export type GameEventUpdatePlayers = {
    "type": "update_players",
    "data":
        {
            "name": string,
            "index": string,
            "score": number
        }[],
    "id": 0
};

export type GameEventQuestion = {
    "type": "question",
    "data": {
        "questionNumber": number,
        "totalQuestions": number,
        "text": string,
        "options": string[],
        "timeLimitSec": number
    },
    "id": 0
}

export type GameEventAnswerAccepted = {
    "type": "answer_accepted",
    "data": {
        "questionIndex": number
    },
    "id": 0
}

export type GameEventQuestionResult = {
    "type": "question_result",
    "data": {
        "questionIndex": number,
        "correctIndex": number,
        "playerResults":
            {
                "name": string,
                "answered": boolean,
                "correct": boolean,
                "pointsEarned": number,
                "totalScore": number
            }[]
    },
    "id": 0
};

export type GameEventGameFinished = {
    "type": "game_finished",
    "data": {
        "scoreboard":
            {
                "name": string,
                "score": number,
                "rank": number
            }[]

    },
    "id": 0
}

export type GameEvent =
    GameEventReg
    | GameEventCreateGame
    | GameEventGameJoined
    | GameEventPlayerJoined
    | GameEventUpdatePlayers
    | GameEventQuestion
    | GameEventAnswerAccepted
    | GameEventQuestionResult
    | GameEventGameFinished;