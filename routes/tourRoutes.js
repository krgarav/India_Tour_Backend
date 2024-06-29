const express = require("express");
const router = express.Router();

const {
  createTour,
  getTourById,
  getAllTour,
  editTour,
  deleteTour,
  createTourPackage
} = require("../controllers/tourController");

router.post("/createtour", createTour);
router.post("/createtourpackage/", createTourPackage);
router.get("/tour/:id", getTourById); //tourId
router.get("/tours", getAllTour);
router.put("/tour/edit/:id", editTour); //tourId
router.delete("/tour/delete/:id", deleteTour); //tourId


module.exports = router;
