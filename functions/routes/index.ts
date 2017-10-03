import * as express from "express";
import * as debug from "debug"
import * as app from "../app";

export const router = express.Router();

router.get("/:sitename", (req, res, next) => {
    console.log("Request params: " + JSON.stringify(req.query));

    // TODO: Check with external API if MAC is existing

    var templateAttributes = {
        title: "Hotspot Login",
        sitename: req.params.sitename,
        host: app.getUnifiHost(),
        mac: req.query.id, // The connecting device's MAC address
        ap: req.query.ap, // MAC address of the AP that device is connecting to
        url: req.query.url || app.getRedirectUrl(),
        timestamp: req.query.t,
        ssid: req.query.ssid
    };

    console.log("Template attributes: " + JSON.stringify(templateAttributes, null, 2));
    if (!templateAttributes.mac || !templateAttributes.ap) {
        return next({
            message: "Missing MAC address. Don't access this page manually!",
            status: 400
        });
    }

    res.render("index", templateAttributes);
});