import {Question} from "../../types";
import {RoomQuestion} from "./room.question";
import {GamePlayer} from "../game/game.player";
import {generateRandomCode} from "../../utils/generate-random-code";
import {GameEventGameFinished, GameEventQuestionResult} from "../event/events.game.types";
import {clearTimeout} from "node:timers";

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
    questionCallback: ((question: RoomQuestion) => void) | undefined = undefined;
    endGameCallback: ((scoreboard: GameEventGameFinished["data"]["scoreboard"]) => void) | undefined;
    questionResultsCallback: ((data: GameEventQuestionResult["data"]) => void) | undefined;
    currentAnswerCount = 0;

    constructor(questions: RoomQuestion[], hostId: string) {
        this.hostId = hostId;
        this.code = generateRandomCode();
        this.questions = questions;
        this.id = crypto.randomUUID();
    }

    startGame() {
        this.status = "in_progress";
        for(const player of this.players) {
            player.score = 0;
        }
        this.nextQuestion();
    }

    answer(id: string, index: number) {
        console.log(id, "answered")
        this.playerAnswers.set(id, {
            answerIndex: index,
            timestamp: Date.now()
        });
        this.currentAnswerCount++;
        console.log(`${this.currentAnswerCount} / ${this.players.length}`)
        if(this.currentAnswerCount >= this.players.length && this.questionTimer !== undefined) {
            this.finishQuestion();
        }
    }



    calculateResults(): GameEventQuestionResult["data"]["playerResults"] {
        return [...this.playerAnswers.entries()].map(pair => {
            const player = this.players.find(el => el.id === pair[0])!;
            const answered = Boolean(this.questionStartTime && pair[1].timestamp > this.questionStartTime);
            const question = this.questions[this.currentQuestion];
            const correct = Boolean(answered && pair[1].answerIndex === question.correctIndex);
            const elapsed = pair[1].timestamp - this.questionStartTime!;
            const pointsEarned = Math.round(Math.max(0, +correct * (BASE_SCORES - elapsed / (question.timeLimitSec * 1000) * BASE_SCORES)))
            player.score = player.score + pointsEarned;
            return {
                name: player.name,
                "answered": answered,
                "correct": answered && pair[1].answerIndex === question.correctIndex,
                "pointsEarned": pointsEarned,
                "totalScore":  player.score
            }
        })
    }

    finishQuestion() {
        clearTimeout(this.questionTimer);
        this.questionTimer = undefined;
        const question = this.questions[this.currentQuestion];
        if(!this.questionResultsCallback) throw "Question results callback is undefined";
        const results = this.calculateResults();
        this.questionResultsCallback({
            questionIndex: this.currentQuestion,
            correctIndex: question.correctIndex,
            playerResults: results
        });
        setTimeout(() => {this.nextQuestion()}, 1000 * 10);
    }

    nextQuestion() {
        this.currentQuestion++;
        this.currentAnswerCount = 0;
        this.questionStartTime = Date.now();
        this.playerAnswers.clear();
        if(this.currentQuestion >= this.questions.length) {
            if(!this.endGameCallback) throw "End game callback is undefined";
            const results = this.players.map(el =>  ({
                name: el.name,
                score: el.score
            }));
            results.sort((a, b) => b.score - a.score);
            this.status = "finished";
            this.endGameCallback(results.map((el, index) => ({
                ...el,
                rank: index + 1
            })));
            return;
        }
        const question = this.questions[this.currentQuestion];
        if(!this.questionCallback) throw "Question callback is undefined";
        this.questionCallback(question);
        this.questionTimer = setTimeout(() => {
            this.finishQuestion()
        }, question.timeLimitSec * 1000);
    }
}