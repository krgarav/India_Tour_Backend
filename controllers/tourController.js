const Tour = require("../models/tourSchema");
const TourData = require("../models/metaDataTourSchema");
const SubImages = require("../models/subImagesSchema");
const upload = require("../middleware/imageUploads"); // Adjust the path as needed
const fs = require("fs");
const path = require("path");

//CREATE TOUR
exports.createTour = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    const {
      title,
      miniDesc,
      price,
      durationDay,
      durationNight,
      location,
      deals,
      rating,
      stars,
      longDesc,
      luxuryHotel,
      wifi,
      transport,
      fooding,
      others,
    } = req.body;

    const tourTitleImage = req.files["TitleImage"]
      ? req.files["TitleImage"][0].filename
      : null;

    const tourImages = req.files["SubImages"]
      ? req.files["SubImages"].map((file) => file.filename)
      : [];

    try {
      const newTour = await Tour.create({
        tourTitle: title,
        miniTourDesc: miniDesc,
        tourTitleImage: tourTitleImage,
        tourPrice: price,
        tourDurationDay: durationDay,
        tourDurationNight: durationNight,
        tourLocation: location,
        topDeals: deals,
        rating: rating,
        stars: stars,
      });

      // Create SubImages entries and associate them with the new Tour
      if (tourImages.length > 0) {
        const subImagesData = tourImages.map((filename) => ({
          filename: filename,
          tourId: newTour.id,
        }));
        await SubImages.bulkCreate(subImagesData);
      }

      // Create TourData entry and associate it with the new Tour
      await TourData.create({
        fullDescription: longDesc,
        luxuryHotel: luxuryHotel,
        wifi: wifi,
        transport: transport,
        fooding: fooding,
        others: others,
        tourId: newTour.id,
      });

      res.status(201).json({
        success: true,
        data: newTour,
      });
    } catch (error) {
      console.error("Error creating tour:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  });
};

//EDIT TOUR
exports.editTour = async (req, res) => {
  const tourId = req.params.id;

  try {
    // Find the tour by ID
    let tour = await Tour.findByPk(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    // Store previous image filenames for deletion
    const previousTourTitleImage = tour.tourTitleImage;
    const previousTourImages = tour.tourImages ? [...tour.tourImages] : [];

    // Update tour fields based on request body
    tour.tourTitle = req.body.title || tour.tourTitle;
    tour.miniTourDesc = req.body.desc || tour.miniTourDesc;
    tour.tourPrice = req.body.price || tour.tourPrice;
    tour.tourDuration = req.body.duration || tour.tourDuration;
    tour.tourLocation = req.body.location || tour.tourLocation;
    tour.topDeals = req.body.deals || tour.topDeals;
    tour.rating = req.body.rating || tour.rating;
    tour.stars = req.body.stars || tour.stars;

    // Handle image uploads and deletion
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // Check if new tourTitleImage is uploaded
      if (req.files && req.files["tourTitleImage"]) {
        tour.tourTitleImage = req.files["tourTitleImage"][0].filename;
      }

      // Check if new images are uploaded
      if (req.files && req.files["images"]) {
        tour.tourImages = req.files["images"].map((file) => file.filename);
      }

      // Delete previous tourTitleImage if a new one is uploaded
      if (req.files && req.files["tourTitleImage"] && previousTourTitleImage) {
        const imagePath = path.join(
          __dirname,
          "..",
          "uploads",
          "images",
          previousTourTitleImage
        );
        fs.unlinkSync(imagePath); // Delete file from server
      }

      // Delete previous tourImages if new images are uploaded
      if (req.files && req.files["images"] && previousTourImages.length > 0) {
        previousTourImages.forEach((image) => {
          if (!tour.tourImages.includes(image)) {
            const imagePath = path.join(
              __dirname,
              "..",
              "uploads",
              "images",
              image
            );
            fs.unlinkSync(imagePath); // Delete file from server
          }
        });
      }

      // Save the updated tour
      await tour.save();

      res.status(200).json({
        success: true,
        data: tour,
      });
    });
  } catch (error) {
    console.error("Error editing tour:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// GET TOUR BY ID
exports.getTourById = async (req, res) => {
  const tourId = req.params.id;

  try {
    const tour = await Tour.findOne({ where: { id: tourId } });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tour,
    });
  } catch (error) {
    console.error("Error fetching tour:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

//GET ALL TOURS
exports.getAllTour = async (req, res) => {
  try {
    const tours = await Tour.findAll();

    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

//DELETE TOUR BY ID
exports.deleteTour = async (req, res) => {
  const tourId = req.params.id;

  try {
    // Find the tour by ID
    const tour = await Tour.findByPk(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    // Delete tour from database
    await tour.destroy();

    // Delete associated images from server (if any)
    if (tour.tourTitleImage) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        tour.tourTitleImage
      );
      fs.unlinkSync(imagePath); // Delete tour title image file from server
    }

    if (tour.tourImages && tour.tourImages.length > 0) {
      tour.tourImages.forEach((image) => {
        const imagePath = path.join(
          __dirname,
          "..",
          "uploads",
          "images",
          image
        );
        fs.unlinkSync(imagePath); // Delete additional tour images files from server
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tour:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
