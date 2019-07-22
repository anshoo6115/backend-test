const snapchat = require('../../../lib/snapchat');
const logger = require('../../../lib/logger');

const snapchatAccountController = require('../account/account');

/* List ad accounts from organization */
const listAdAccounts = async (req, res) => {
    try {
        const snapchatAccessToken = await snapchatAccountController.getSnapchatAccessToken();
        const adAccountList = await snapchat.getAdAccounts(snapchatAccessToken);
        return res.status(200).json({
            data: adAccountList.adaccounts.map(el => ({
                id: el.adaccount.id,
                name: el.adaccount.name,
            })),
        });
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

module.exports = {
    listAdAccounts,
};
