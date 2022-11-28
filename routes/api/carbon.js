const express = require("express");
const router = express.Router();
const {
  getYesterdayCarbonSavings,
} = require("../../controllers/CarbonController");

router.route("/:user").get(getYesterdayCarbonSavings);

module.exports = router;
