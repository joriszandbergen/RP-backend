const express = require("express");
const router = express.Router();
const {
  logChargeEvent,
  getLatestChargeLog,
} = require("../../controllers/chargeLogController");

router.route("/").post(logChargeEvent);
router.route("/:user").get(getLatestChargeLog);

module.exports = router;
