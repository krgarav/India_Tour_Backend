const express = require("express");
const router = express.Router();

const {
  createTourPackage,
  deleteTourPackage,
  deleteTourFromPackage,
  getAllPackageToursAndTours,
  getAllPackageTours,
  editTourPackage,
} = require("../controllers/tourPackageController");

router.get("/get/tourpackages", getAllPackageTours); 
router.get("/get/tourpackage/details", getAllPackageToursAndTours); /*tourpackageId*/
router.post("/createtourpackage", createTourPackage);
// router.put("/edittourpackage/:id", editTourPackage);
router.delete("/delete/tourpackage/:id", deleteTourPackage); /*tourpackageId*/
router.delete("/delete/tourfrompackage", deleteTourFromPackage);

module.exports = router;
