const router = require("express").Router();
const trxController = require("../controllers/trx");

/**
 * @swagger
 * /trx/generateTRXWallet:
 *   get:
 *     tags:
 *       - TRX COIN
 *     description: Creating Docs
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: mnemonic
 *         description:
 *         in: query
 *         required: true
 *       - name: count
 *         description:
 *         in: query
 *         required: false
 *       - name: accountName
 *         description:
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Wallet generated successfully
 *       404:
 *         description: Data not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/generateTRXWallet", trxController.generateTRXWallet);
