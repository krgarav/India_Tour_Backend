const sequelize = require("../utils/database");
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const TourPackage = require("../models/tourPackageSchema");
const TourTourPackageRelation = require("../models/tour-tourPackageRelation");
const Tour = require("../models/tourSchema");
const upload = require("../middleware/imageUploads"); // Adjust the path to your upload middleware
const { Op } = require("sequelize");

//GET RELATED TOURS
exports.getRelatedTours = async (req, res) => {
  const { city, state } = req.query;

  try {
    let whereClause = {};
    if (city) {
      whereClause.tourLocationCity = city;
    }
    if (state) {
      whereClause.tourLocationState = state;
    }

    // Fetch initial related tours
    let tours = await Tour.findAll({ where: whereClause });

    // If the length is less than 3, fetch more tours to fill up
    if (tours.length < 3) {
      const fetchedTourIds = tours.map((tour) => tour.id);

      const additionalTours = await Tour.findAll({
        where: {
          id: {
            [Op.notIn]: fetchedTourIds,
          },
        },
        order: sequelize.random(), // Fetch in random order
        limit: 3 - tours.length,
      });

      tours = tours.concat(additionalTours);
    }

    if (!tours.length) {
      return res.status(404).json({ message: "No related tours found." });
    }

    return res.status(200).json(tours);
  } catch (error) {
    console.error("Error retrieving related tours:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving related tours." });
  }
};

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
    let imagePath;
    if (tourPackageBgImageName !== null) {
      imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        tourPackageBgImageName
      );
    }

    if (!tourPackageTitle || !toursIncluded) {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      return res.status(400).json({
        success: false,
        message: "Tour Package Title, Tours, or Background Image is empty",
      });
    }

    let transaction;

    try {
      transaction = await sequelize.transaction();

      // Parse toursIncluded if it's a string (e.g., if sent as JSON)
      const toursArray =
        typeof toursIncluded === "string"
          ? JSON.parse(toursIncluded)
          : toursIncluded;

      // Validate that toursArray is an array
      if (!Array.isArray(toursArray)) {
        await transaction.rollback();
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        return res.status(400).json({
          success: false,
          message: "Invalid or empty toursIncluded array.",
        });
      }

      // Validate that tourPackageTitle is unique
      const existingPackage = await TourPackage.findOne({
        where: { packageTitle: tourPackageTitle },
      });
      if (existingPackage) {
        await transaction.rollback();
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        return res.status(400).json({
          success: false,
          message: "Duplicate Tour Package. Cannot create.",
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
        message: "Tour package created successfully.",
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error creating tour package:", error);

      // Delete the uploaded image if any error occurs
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  });
};

//EDIT TOUR PACKAGE TITLE AND BACKGROUND IMAGE
exports.editTourPackage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid input.",
        errors: errors.array(),
      });
    }

    const tourPackageId = req.params.id;
    const { tourPackageTitle } = req.body;
    const tourPackageBgImageName =
      req.files?.TourBGImage?.[0]?.filename || null;

    let newImagePath;
    if (tourPackageBgImageName !== null) {
      newImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        tourPackageBgImageName
      );
    }

    let transaction;

    try {
      transaction = await sequelize.transaction();

      const tourPackage = await TourPackage.findByPk(tourPackageId, {
        transaction,
      });
      if (!tourPackage) {
        await transaction.rollback();
        if (newImagePath && fs.existsSync(newImagePath)) {
          fs.unlinkSync(newImagePath);
        }
        return res.status(404).json({
          success: false,
          message: "Tour package not found.",
        });
      }

      if (tourPackageBgImageName) {
        const previousBGImageName = tourPackage.backgroundImage;

        if (previousBGImageName) {
          // Delete associated image from server (if any)
          const prevImagePath = path.join(
            __dirname,
            "..",
            "uploads",
            "images",
            previousBGImageName
          );

          try {
            if (fs.existsSync(prevImagePath)) {
              fs.unlinkSync(prevImagePath); // Delete previous tour package image file from server
            }
          } catch (fsError) {
            console.error("Error deleting previous background image:", fsError);
          }
        }
      }

      tourPackage.packageTitle = tourPackageTitle || tourPackage.packageTitle;
      tourPackage.backgroundImage =
        tourPackageBgImageName || tourPackage.backgroundImage;

      await tourPackage.save({ transaction });

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Tour package updated successfully.",
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error updating tour package:", error);

      // Delete the newly uploaded image if any error occurs
      if (newImagePath && fs.existsSync(newImagePath)) {
        fs.unlinkSync(newImagePath);
      }

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
//Get All  tours related to package
exports.getAllToursRelatedToPackage = async (req, res) => {
  const { packageId } = req.params;
  if (!packageId) {
    return res.status(400).json({
      success: false,
      message: "Tour package ID required",
    });
  }

  try {
    const packageWithTours = await TourTourPackageRelation.findAll({
      where: { TourPackageId: packageId },
    });
    const packageDetails = await TourPackage.findAll({
      where: { id: packageId },
    });
    // Extract package IDs from the relations
    const tourIds = packageWithTours.map((relation) => relation.TourId);

    if (!packageWithTours || packageWithTours.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }

    const tours = await Tour.findAll({ where: { id: tourIds } });

    if (!tours) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({ success: true, tours, packageDetails });
  } catch (error) {
    console.error("Error retrieving package tours and tours:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving package tours and tours",
    });
  }
};
//Get All  tours packages related to tours
exports.getAllPackagesRelatedToTours = async (req, res) => {
  const { tourId } = req.params;
  if (!tourId) {
    return res.status(400).json({
      success: false,
      message: "Tour ID required",
    });
  }

  try {
    const packageWithTours = await TourTourPackageRelation.findAll({
      where: { TourId: tourId },
    });

    if (!packageWithTours || packageWithTours.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }
    // Extract package IDs from the relations
    const packageIds = packageWithTours.map(
      (relation) => relation.TourPackageId
    );

    // Fetch details for all related packages
    const packageDetails = await TourPackage.findAll({
      where: {
        id: packageIds,
      },
    });
    res.status(200).json({ success: true, packageDetails });
  } catch (error) {
    console.error("Error retrieving package tours and tours:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving package tours and tours",
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

//ADD TOURS TO TOUR PACKAGE
exports.addTourInTourPackage = async (req, res) => {
  const { tourPackageId, toursIncluded } = req.body;

  if (!tourPackageId || !toursIncluded) {
    return res
      .status(400)
      .send({ message: "Invalid tour package ID or tours included" });
  }

  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Parse toursIncluded if it's a string (e.g., if sent as JSON)
    const toursArray =
      typeof toursIncluded === "string"
        ? JSON.parse(toursIncluded)
        : toursIncluded;

    // Validate that toursArray is an array
    if (!Array.isArray(toursArray)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid or empty toursIncluded array.",
      });
    }

    const existingTours = [];

    try {
      // Use Promise.all to ensure all async operations complete
      await Promise.all(
        toursArray.map(async (tourId) => {
          // Check if the relation already exists
          const existingRelation = await TourTourPackageRelation.findOne({
            where: {
              TourPackageId: tourPackageId,
              TourId: tourId,
            },
            transaction,
          });

          if (existingRelation) {
            existingTours.push(tourId);
          } else {
            // Create the new relation if it doesn't exist
            await TourTourPackageRelation.create(
              {
                TourPackageId: tourPackageId,
                TourId: tourId,
              },
              { transaction }
            );
          }
        })
      );

      if (existingTours.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "One of the Tour Already Added in this Package",
        });
      }
    } catch (error) {
      await transaction.rollback();
      return res.status(500).send({
        message: "An error occurred while adding tours to the package.",
        error: error.message,
      });
    }

    await transaction.commit();

    res.status(200).send({ message: "Tours successfully added to package" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error adding tours to package:", error);
    res.status(500).send({
      message: "An error occurred while adding the tours to the package",
      error: error.message,
    });
  }
};
