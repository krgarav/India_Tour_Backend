const sequelize = require("../utils/database");
const Tour = require("../models/tourSchema");
const TourData = require("../models/metaDataTourSchema");
const SubImages = require("../models/subImagesSchema");
const ItneryTour = require("../models/itneryTourSchema");
const upload = require("../middleware/imageUploads"); // Adjust the path to your upload middleware
const fs = require("fs");
const path = require("path");

const updateTourFields = async (req, tour) => {
  tour.tourTitle = req.body.title || tour.tourTitle;
  tour.miniTourDesc = req.body.miniDesc || tour.miniTourDesc;
  tour.tourPrice = req.body.price || tour.tourPrice;
  tour.tourDurationDay = req.body.durationDay || tour.tourDurationDay;
  tour.tourDurationNight = req.body.durationNight || tour.tourDurationNight;
  tour.tourLocation = req.body.location || tour.tourLocation;
  tour.topDeals = req.body.deals || tour.topDeals;
  tour.rating = req.body.rating || tour.rating;
  tour.stars = req.body.stars || tour.stars;
};

const updateTourDataFields = async (req, tour) => {
  if (tour.TourDatum) {
    tour.TourDatum.fullDescription =
      req.body.longDesc || tour.TourDatum.fullDescription;
    tour.TourDatum.luxuryHotel =
      req.body.luxuryHotel || tour.TourDatum.luxuryHotel;
    tour.TourDatum.wifi = req.body.wifi || tour.TourDatum.wifi;
    tour.TourDatum.transport = req.body.transport || tour.TourDatum.transport;
    tour.TourDatum.fooding = req.body.fooding || tour.TourDatum.fooding;
    tour.TourDatum.others = req.body.others || tour.TourDatum.others;
  }
};

const handleTourTitleImageUpload = async (
  req,
  tour,
  previousTourTitleImage
) => {
  if (req.files && req.files["TitleImage"]) {
    tour.tourTitleImage = req.files["TitleImage"][0].filename;

    if (previousTourTitleImage) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        previousTourTitleImage
      );
      fs.unlinkSync(imagePath);
    }
  }
};

const handleSubImagesUpload = async (
  req,
  tour,
  previousSubImages,
  transaction
) => {
  if (req.files && req.files["SubImages"]) {
    const newSubImages = req.files["SubImages"].map((file) => ({
      filename: file.filename,
      tourId: tour.id,
    }));

    await SubImages.destroy({ where: { tourId: tour.id }, transaction });
    await SubImages.bulkCreate(newSubImages, { transaction });

    if (previousSubImages.length > 0) {
      previousSubImages.forEach((image) => {
        const imagePath = path.join(
          __dirname,
          "..",
          "uploads",
          "images",
          image
        );
        fs.unlinkSync(imagePath);
      });
    }
  }
};

//EDIT TOUR
exports.editTour = async (req, res) => {
  const tourId = req.params.id;
  let transaction;

  try {
    transaction = await sequelize.transaction();
    let tour = await Tour.findByPk(tourId, {
      include: [{ model: SubImages }, { model: TourData }],
      transaction,
    });

    if (!tour) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    const previousTourTitleImage = tour.tourTitleImage;
    const previousSubImages = tour.SubImages.map(
      (subImage) => subImage.filename
    );

    upload(req, res, async (err) => {
      if (err) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      try {
        // Update tour fields
        await updateTourFields(req, tour);
        // Update tour data fields
        await updateTourDataFields(req, tour);
        // Handle title image upload
        await handleTourTitleImageUpload(
          req,
          tour,
          previousTourTitleImage,
          transaction
        );
        // Handle sub-images upload
        await handleSubImagesUpload(req, tour, previousSubImages, transaction);

        await tour.save({ transaction });
        if (tour.TourDatum) {
          await tour.TourDatum.save({ transaction });
        }

        await transaction.commit();

        res.status(200).json({
          success: true,
          data: tour,
        });
      } catch (error) {
        await transaction.rollback();
        console.error("Error editing tour:", error);
        res.status(500).json({
          success: false,
          message: "Server error. Please try again later.",
        });
      }
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error editing tour:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

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
      itneryTourDetails,
    } = req.body;

    const tourTitleImage = req.files?.TitleImage?.[0]?.filename || null;
    const tourImages = req.files?.SubImages?.map((file) => file.filename) || [];

    let transaction;

    try {
      // Start a transaction
      transaction = await sequelize.transaction();

      // Create the new tour
      const newTour = await Tour.create(
        {
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
        },
        { transaction }
      );

      // Create SubImages entries and associate them with the new Tour
      if (tourImages.length > 0) {
        const subImagesData = tourImages.map((filename) => ({
          filename: filename,
          tourId: newTour.id,
        }));
        await SubImages.bulkCreate(subImagesData, { transaction });
      }

      // Create TourData entry and associate it with the new Tour
      await TourData.create(
        {
          fullDescription: longDesc,
          luxuryHotel: luxuryHotel,
          wifi: wifi,
          transport: transport,
          fooding: fooding,
          others: others,
          tourId: newTour.id,
        },
        { transaction }
      );

      // let parsedItneryTourDetails = JSON.parse(itneryTourDetails);

      // if (
      //   Array.isArray(parsedItneryTourDetails) &&
      //   parsedItneryTourDetails.length > 0
      // ) {
      //   // Map the parsed itneryTourDetails to match the ItneryTour model fields
      //   const itneryTourDetailsCreate = parsedItneryTourDetails.map(
      //     (itinerary) => ({
      //       title: itinerary.title,
      //       desc: itinerary.desc,
      //       day: itinerary.day,
      //       tourId: newTour.id, // Assuming newTour.id is set correctly
      //     }),
      //     { transaction }
      //   );
      //   try {
      //     // Bulk create the ItneryTour entries
      //     await ItneryTour.bulkCreate(itneryTourDetailsCreate);
      //     console.log("ItneryTour entries created successfully.");
      //   } catch (error) {
      //     console.error("Error creating ItneryTour entries:", error);
      //     // Handle the error appropriately
      //   }
      // } else {
      //   console.error("Invalid or empty itneryTourDetails array.");
      //   // Handle case where itneryTourDetails is not in expected format or is empty
      // }

      // Commit the transaction
      await transaction.commit();

      res.status(201).json({
        success: true,
        data: newTour,
      });
    } catch (error) {
      // Rollback the transaction in case of error
      if (transaction) await transaction.rollback();
      console.error("Error creating tour:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  });
};

// GET TOUR BY ID
exports.getTourById = async (req, res) => {
  const { id } = req.params;

  try {
    const tour = await Tour.findByPk(id, {
      include: [{ model: SubImages }, { model: TourData }],
    });

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
    let tours = await Tour.findAll({});

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
