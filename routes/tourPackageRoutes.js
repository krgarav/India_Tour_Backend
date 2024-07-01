const express = require("express");
const router = express.Router();

const { createTourPackage } = require("../controllers/tourPackageController");

router.post("/createtourpackage", createTourPackage);

module.exports = router;
