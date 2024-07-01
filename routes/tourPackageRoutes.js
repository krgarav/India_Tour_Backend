const express = require("express");
const router = express.Router();

const {
  createTourPackage,
  deleteTourPackage,
  editTourPackage,
} = require("../controllers/tourPackageController");

router.post("/createtourpackage", createTourPackage);
router.put("/edittourpackage/:id", editTourPackage);
router.delete("/deletetourpackage/:id", deleteTourPackage);

module.exports = router;
