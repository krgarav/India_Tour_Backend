const sequelize = require("../utils/database");
const path = require("path");
const fs = require("fs");
const TourPackage = require("../models/tourPackageSchema");
const upload = require("../middleware/imageUploads"); // Adjust the path to your upload middleware

//CREATE TOUR PACKAGE
exports.createTourPackage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    const { tourPackageTitle, toursIncluded } = req.body;

    // Extract tourPackageImage filename
    const tourPackageBgImageName =
      req.files?.TourBGImage?.[0]?.filename || null;

    let transaction;

    try {
      transaction = await sequelize.transaction();

      // Parse toursIncluded if it's a string (e.g., if sent as JSON)
      const toursArray =
        typeof toursIncluded === "string"
          ? JSON.parse(toursIncluded)
          : toursIncluded;

      // Validate that toursArray is an array
      if (!Array.isArray(toursArray) || toursArray.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Invalid or empty toursIncluded array.",
        });
      }

      // Find existing tour IDs in the package
      const existingTours = await TourPackage.findAll({
        where: {
          tourId: toursArray,
          packageTitle: tourPackageTitle,
        },
        transaction,
      });

      const existingTourIds = existingTours.map((tour) => tour.tourId);

      // Filter out existing tour IDs from the toursArray
      const newToursArray = toursArray.filter(
        (tourId) => !existingTourIds.includes(tourId)
      );

      // If there are no new tours to add, return an appropriate message
      if (newToursArray.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Some Tours already added to the package.",
        });
      }
      // Map the tourPackageData for new tours
      const tourPackageData = newToursArray.map((tourId) => ({
        packageTitle: tourPackageTitle,
        backgroundImage: tourPackageBgImageName,
        tourId,
      }));

      try {
        // Bulk create the new tour packages
        await TourPackage.bulkCreate(tourPackageData, { transaction });
        // Commit the transaction
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Tour not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Tour packages created successfully.",
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error creating tour packages:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  });
};

//DELETE TOUR PACKAGE
exports.deleteTourPackage = async (req, res) => {
  const tourPackageId = req.params.id;

  if (!tourPackageId) {
    return res.status(400).send({ message: "Invalid tour package ID" });
  }

  let transaction;

  try {
    transaction = await sequelize.transaction();
    // Find the tour package by its ID
    const tourPackage = await TourPackage.findByPk(tourPackageId, {
      transaction,
    });

    if (!tourPackage) {
      await transaction.rollback();
      return res.status(404).send({ message: "Tour package not found" });
    }

    // Find and delete all tour packages with the same packageTitle
    const deleteCount = await TourPackage.destroy({
      where: {
        packageTitle: tourPackage.packageTitle,
      },
      transaction,
    });

    // Delete associated images from server (if any)
    if (tourPackage.backgroundImage) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        tourPackage.backgroundImage
      );

      fs.unlinkSync(imagePath); // Delete tour title image file from server
    }

    await transaction.commit();
    console.log(
      `Deleted ${deleteCount} tour packages with title: ${tourPackage.packageTitle}`
    );

    res
      .status(200)
      .send({ message: `Deleted ${deleteCount} tour packages successfully` });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting tour packages:", error);
    res
      .status(500)
      .send({ message: "An error occurred while deleting tour packages" });
  }
};

//EDIT TOUR PACKAGE
exports.editTourPackage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    const tourPackageId = req.params.id;
    const { tourPackageTitle, toursIncluded } = req.body;

    // Extract tourPackageImage filename
    const tourPackageBgImageName =
      req.files?.TourBGImage?.[0]?.filename || null;

    let transaction;

    try {
      transaction = await sequelize.transaction();

      // Check if the tour package exists
      const tourPackage = await TourPackage.findByPk(tourPackageId, {
        transaction,
      });

      if (!tourPackage) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Tour package not found.",
        });
      }

      const tourPackageData = await TourPackage.findAll({
        where: {
          packageTitle: tourPackage.packageTitle,
        },
        transaction,
      });

      for (const tour of tourPackageData) {
        // Update the tour package details
        tour.packageTitle = tourPackageTitle || tour.packageTitle;
        if (tourPackageBgImageName) {
          tour.backgroundImage = tourPackageBgImageName;
        }
        await tour.save({ transaction });
      }

      // Commit the transaction
      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Tour package updated successfully.",
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error updating tour package:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  });
};
