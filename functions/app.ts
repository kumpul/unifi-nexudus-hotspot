import * as functions from "firebase-functions";

import * as express from "express";
import * as expressLayouts from 'express-ejs-layouts';
import * as path from "path";
import * as favicon from "serve-favicon";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";

import * as errors from "./routes/errors";
import * as index from "./routes/index";
import * as authenticate from "./routes/authenticate";

export const hotspot = express();

hotspot.use(logger('dev'));
hotspot.use(bodyParser.json());
hotspot.use(bodyParser.urlencoded({ extended: false }));
hotspot.use(cookieParser());

// view engine setup
hotspot.set('views', path.join(__dirname, 'views'));
hotspot.set('view engine', 'ejs');
hotspot.use(expressLayouts);

hotspot.use("/guest/s", index.router);
hotspot.use("/authenticate", authenticate.router);

export function getNexudusName() {
    return functions.config().nexudus.shortname || "nexudus";
}

export function getRedirectUrl() {
    return functions.config().unifi.redirect_url || "https://www.kumpul.co";
}

export function getUnifiHost() {
    return functions.config().unifi.host || "127.0.0.1";
}

export function getUnifiPort() {
    return functions.config().unifi.port || 8443;
}

export function isUnifiSelfSigned() {
    return !!functions.config().unifi.is_selfsigned;
}

export function getUnifiUser() {
    return functions.config().unifi.username || "admin";
}

export function getUnifiPassword() {
    return functions.config().unifi.password || "";
}

export function getUnifiUrl() {
    const unifiHost = getUnifiHost();
    const unifiPort = getUnifiPort();
    return `https://${unifiHost}:${unifiPort}`;
}