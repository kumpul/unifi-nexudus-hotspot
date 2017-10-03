import * as express from "express";
import * as rp from "request-promise";
import * as unifi from "@oddbit/unifi";
import * as nx from "@oddbit/nexudus";
import * as app from "../app";

export const router = express.Router();
router.post("/", async (req, res, next) => {
    console.log(JSON.stringify(req.body, null, 2));

    const mac = req.body.mac;
    const ap = req.body.ap;
    const email = req.body.email;
    const password = req.body.password;
    const sitename = req.body.sitename;
    let redirectUrl = req.body.url || app.getRedirectUrl();

    if (req.body.url === "http://connectivitycheck.gstatic.com/generate_204") {
        redirectUrl = app.getRedirectUrl();;
    }

    // Check with Nexudus if the provided email/password is an active member
    let nexudusCoworker;
    const nxPublicApi = new nx.PublicApiClient(app.getNexudusName(), email, password);

    try {
        nexudusCoworker = await nxPublicApi.getCoworker();
    } catch (err) {
        console.log("Error object: " + JSON.stringify(err, null, 2));
        console.error(`Could not connect to Nexudus: ${err.message}`);
        return next({
            message: err.message,
            status: err.statusCode
        });
    }

    // Stop the process if the visitor doesn't have a valid membership
    if (!nexudusCoworker.IsMember) {
        res.redirect(200, '/membership-expired.html');
        return;
    }

    // Activate MAC at hotspot
    const apiAdminUser = app.getUnifiUser();
    const apiAdminPassword = app.getUnifiPassword();

    const unifiController = new unifi.UnifiController({
        host: app.getUnifiHost(),
        isSelfSigned: app.isUnifiSelfSigned(),
        siteName: sitename
    });

    let authorizedClientResponse;
    try {
        console.log(`Logging in ${apiAdminUser} at UniFi guest portal ...`);
        await unifiController.login(apiAdminUser, apiAdminPassword);

        console.log(`Authorizing device "${mac}" at access point "${ap}"...`);
        authorizedClientResponse = await unifiController.authorizeGuest(mac, ap);
    } catch (err) {
        console.log("Error object: " + JSON.stringify(err, null, 2));
        console.error(`Could not activate MAC '${mac}' at the hotspot: ${err.message}`);
        return next({
            message: err.message,
            status: err.statusCode
        });
    }

    // Let the client off the hook here.
    console.log(`All done. Redirecting the client to: ${redirectUrl}`);
    res.redirect(302, redirectUrl);

    const macTuples = authorizedClientResponse.mac.split();
    await unifiController.setClientAlias(authorizedClientResponse._id, `${nexudusCoworker.FullName} (${macTuples[0]}:...:${macTuples[5]})`);

    // Finally close the shop
    // The logout response likes to throw a HTTP 302 "error". So we'll catch it and ignore it.
    try {
        console.log(`Logging out api user "${apiAdminUser}" from controller ...`);
        await unifiController.logout();
    } catch (err) {
        if (err.statusCode >= 400) {
            return next({
                message: err.message,
                status: err.statusCode
            });
        }
    }



});