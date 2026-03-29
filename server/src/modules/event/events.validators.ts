import {GameEvent} from "./events.types";

export function validateEvent(obj: unknown): obj is GameEvent<string, any> {
    return obj !== null && obj !== undefined && typeof obj === "object"
        && "type" in obj && typeof obj["type"] === "string"
        && "id" in obj && typeof obj["id"] === "number"
        && "data" in obj && typeof obj["data"] === "object" && obj["data"] !== undefined && obj["data"] !== null;
}