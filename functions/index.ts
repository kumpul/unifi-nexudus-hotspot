import * as functions from "firebase-functions";
import * as app from "./app";

export const expressApp = functions.https.onRequest(app.hotspot);

export * from "./database";
