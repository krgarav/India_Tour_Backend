const sequelize = require("../utils/database");
const path = require("path");
const fs = require("fs");
const TourPackage = require("../models/tourPackageSchema");
const TourTourPackageRelation = require("../models/tour-tourPackageRelation");
const Tour = require("../models/tourSchema");
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

      // Validate that tourPackageTitle already available
      if (
        await TourPackage.findOne({ where: { packageTitle: tourPackageTitle } })
      ) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Duplicate Tour Package Can't Created",
        });
      }

      // Create the new TourPackage
      const newPackage = await TourPackage.create(
        {
          packageTitle: tourPackageTitle,
          backgroundImage: tourPackageBgImageName,
        },
        { transaction }
      );

      // Create the relationships in the through table
      for (const tourId of toursArray) {
        await TourTourPackageRelation.create(
          {
            TourPackageId: newPackage.id,
            TourId: tourId,
          },
          { transaction }
        );
      }

      await transaction.commit();

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

//GET ALL PACKAGES
exports.getAllPackageTours = async (req, res) => {
  try {
    const allPackageTours = await TourPackage.findAll();
    res.status(200).json({ success: true, allPackageTours });
  } catch (error) {
    console.error("Error retrieving all package tours:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving package tours",
    });
  }
};

//GET ALL PACKAGES BY PACKAGE TOUR ID
exports.getAllPackageToursAndTours = async (req, res) => {
  const { tourPackageId, tourId } = req.query;

  if (!tourPackageId || !tourId) {
    return res.status(400).json({
      success: false,
      message: "Tour package ID or Tour ID is required",
    });
  }

  try {
    const packageWithTours = await TourTourPackageRelation.findAll({
      where: { TourPackageId: tourPackageId, TourId: tourId },
    });

    if (!packageWithTours || packageWithTours.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }

    const tour = await Tour.findByPk(packageWithTours[0].TourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({ success: true, packageWithTours, tour });
  } catch (error) {
    console.error("Error retrieving package tours and tours:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving package tours and tours",
    });
  }
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

    // Delete associated images from server (if any)
    if (tourPackage.backgroundImage) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        tourPackage.backgroundImage
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete tour package image file from server
      }
    }

    // Delete associated tour relationships
    await TourTourPackageRelation.destroy({
      where: { TourPackageId: tourPackageId },
      transaction,
    });

    // Delete the tour package itself
    await TourPackage.destroy({
      where: { id: tourPackageId },
      transaction,
    });

    await transaction.commit();

    res.status(200).send({ message: "Tour package deleted successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error deleting tour package:", error);
    res.status(500).send({
      message: "An error occurred while deleting the tour package",
    });
  }
};

//DELETE TOUR FROM TOUR PACKAGES
exports.deleteTourFromPackage = async (req, res) => {
  const { tourPackageId, tourId } = req.query;

  if (!tourPackageId || !tourId) {
    return res
      .status(400)
      .send({ message: "Invalid tour package ID or tour ID" });
  }

  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Check if the relationship exists
    const relation = await TourTourPackageRelation.findOne({
      where: { TourPackageId: tourPackageId, TourId: tourId },
      transaction,
    });

    if (!relation) {
      await transaction.rollback();
      return res.status(404).send({ message: "Relation not found" });
    }

    // Delete the tour relationship
    await relation.destroy({ transaction });

    await transaction.commit();

    res.status(200).send({ message: "Tour successfully removed from package" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error deleting tour from package:", error);
    res.status(500).send({
      message: "An error occurred while deleting the tour from the package",
    });
  }
};

// working in edit >>>>>>>>>>>>>>>>>

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
