const express = require("express");
const router = express.Router();

const {
  createTour,
  getTourById,
  getAllTour,
  editTour,
  deleteTour,
} = require("../controllers/tourController");

router.post("/createtour", createTour);
// router.get("/tour/:id", getTourById);
// router.get("/tours", getAllTour);
// router.put("/tour/edit/:id", editTour);
// router.delete("/tour/delete/:id", deleteTour);

module.exports = router;
