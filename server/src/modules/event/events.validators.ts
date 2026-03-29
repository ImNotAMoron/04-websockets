import {PlayerEvent} from "./events.player.types";

export function validatePlayerEvent(obj: unknown): obj is PlayerEvent {
    return obj !== null && obj !== undefined && typeof obj === "object"
        && "type" in obj && typeof obj["type"] === "string"
        && "id" in obj && typeof obj["id"] === "number"
        && "data" in obj && typeof obj["data"] === "object" && obj["data"] !== undefined && obj["data"] !== null;
}