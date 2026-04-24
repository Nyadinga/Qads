const express = require("express");
const router = express.Router();

const {
  getActiveCampaignsHandler,
} = require("./promoter.controller");

const { requireAuth } = require("../../../middlewares/auth.Middleware");

console.log("promoter requireAuth:", typeof requireAuth);
console.log("promoter getActiveCampaignsHandler:", typeof getActiveCampaignsHandler);

router.get(
  "/activecampaigns",
  requireAuth,
  getActiveCampaignsHandler
);

console.log("INSIDE promoter.routes.js export type:", typeof router);

module.exports = router;