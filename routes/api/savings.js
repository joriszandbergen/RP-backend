const express = require("express");
const router = express.Router();
const { getYesterdaySavings } = require("../../controllers/CostController");

router.route("/:user").get(getYesterdaySavings);

module.exports = router;
