const express = require("express");
const router = express.Router();
const {
  getYesterdayPlannings,
} = require("../../controllers/PlanningController");

router.route("/:user").get(getYesterdayPlannings);

module.exports = router;
