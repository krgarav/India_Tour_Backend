const express = require("express");
const router = express.Router();

const {
  createTour,
  getTourById,
  getAllTours,
  editTour,
  deleteTour,
  getAllTopTours,
  fetchHomePageSection,
  addToHomePageSection,
  removeHomePageSection,
} = require("../controllers/tourController");

router.post("/createtour", createTour);
router.get("/fetchhomepagesection", fetchHomePageSection);
router.post("/addhomepagesection", addToHomePageSection);
router.post("/removehomepagesection", removeHomePageSection);
router.get("/tour/:id", getTourById); //tourId
router.get("/tours", getAllTours);
router.get("/top/tours", getAllTopTours);
router.put("/tour/edit/:id", editTour); //tourId
router.delete("/tour/delete/:id", deleteTour); //tourId

module.exports = router;
