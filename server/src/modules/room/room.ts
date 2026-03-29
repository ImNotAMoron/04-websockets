import {Question} from "../../types";
import {RoomQuestion} from "./room.question";
import {GamePlayer} from "../game/game.player";
import {generateRandomCode} from "../../utils/generate-random-code";
import {GameEventQuestionResult} from "../event/events.game.types";

const BASE_SCORES = 1000;

export class Room {
    status: 'waiting' | 'in_progress' | 'finished' = "waiting";
    hostId: string;
    questions: RoomQuestion[] = [];
    players: GamePlayer[] = [];
    id: string;
    code: string;
    currentQuestion: number = -1;
    questionStartTime?: number;
    questionTimer?: NodeJS.Timeout;
    playerAnswers: Map<string, { answerIndex: number; timestamp: number }> = new Map();
    scores: Map<string, number> = new Map();
    questionCallback: ((question: RoomQuestion) => void) | undefined = undefined;
    endGameCallback: (() => void) | undefined;
    questionResultsCallback: ((data: GameEventQuestionResult["data"]) => void) | undefined;

    constructor(questions: RoomQuestion[], hostId: string) {
        this.hostId = hostId;
        this.code = generateRandomCode();
        this.questions = questions;
        this.id = crypto.randomUUID();
    }

    startGame() {
        this.status = "in_progress";
        this.nextQuestion();
    }

    answer(id: string, index: number) {
        this.playerAnswers.set(id, {
            answerIndex: index,
            timestamp: Date.now()
        });
    }



    calculateResults(): GameEventQuestionResult["data"]["playerResults"] {
        return [...this.playerAnswers.entries()].map(pair => {
            const player = this.players.find(el => el.id === pair[0])!;
            const answered = Boolean(this.questionStartTime && pair[1].timestamp > this.questionStartTime);
            const question = this.questions[this.currentQuestion];
            const correct = Boolean(answered && pair[1].answerIndex === question.correctIndex);
            const pointsEarned = Math.max(0, +correct * (BASE_SCORES - (question.timeLimitSec - Date.now() + this.questionStartTime!) / (question.timeLimitSec * 1000) * BASE_SCORES))
            // basescore - ((d.n - qs)/tl) * baseScro
            // ti
            return {
                name: player.name,
                "answered": answered,
                "correct": answered && pair[1].answerIndex === question.correctIndex,
                "pointsEarned": pointsEarned,
                "totalScore": player.score + pointsEarned
            }
        })
    }

    nextQuestion() {
        this.currentQuestion++;
        this.questionStartTime = Date.now();
        this.playerAnswers.clear();
        if(this.currentQuestion >= this.questions.length) {
            if(!this.endGameCallback) throw "End game callback is undefined";
            this.endGameCallback();
            return;
        }
        const question = this.questions[this.currentQuestion];
        if(!this.questionCallback) throw "Question callback is undefined";
        this.questionCallback(question);
        setTimeout(() => {
            if(!this.questionResultsCallback) throw "Question results callback is undefined";
            const results = this.calculateResults();
            this.questionResultsCallback({
                questionIndex: this.currentQuestion,
                correctIndex: question.correctIndex,
                playerResults: results
            });
            this.nextQuestion()
        }, question.timeLimitSec);
    }
}