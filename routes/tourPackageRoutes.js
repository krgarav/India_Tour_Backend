const express = require("express");
const router = express.Router();

const {
  createTourPackage,
  deleteTourPackage,
  deleteTourFromPackage,
  getAllPackageToursAndTours,
  getAllPackageTours,
  editTourPackage,
  addTourInTourPackage,
  getRelatedTours,
  getAllToursRelatedToPackage,
  getAllPackagesRelatedToTours

} = require("../controllers/tourPackageController");

router.get("/get/tourpackages", getAllPackageTours);
router.get("/get/tourpackage/details",getAllPackageToursAndTours); /*tourpackageId*/
router.get("/get/tourpackage/:packageId",getAllToursRelatedToPackage); /*tourpackageId*/
router.get("/gettourpackages/:tourId",getAllPackagesRelatedToTours); /*tourId*/
router.get("/get/related/tours", getRelatedTours); /*tourpackageId*/
router.post("/createtourpackage", createTourPackage);
router.post("/add/tour/tourpackage", addTourInTourPackage);
router.put("/edit/tourpackage/:id", editTourPackage); /*tourpackageId*/
router.delete("/delete/tourpackage/:id", deleteTourPackage); /*tourpackageId*/
router.delete("/delete/tourfrompackage", deleteTourFromPackage);

module.exports = router;
