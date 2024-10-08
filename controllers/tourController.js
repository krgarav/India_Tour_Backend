const sequelize = require("../utils/database");
const Tour = require("../models/tourSchema");
const TourData = require("../models/metaDataTourSchema");
const SubImages = require("../models/subImagesSchema");
const ItneryTour = require("../models/itneryTourSchema");
const TourPackage = require("../models/tourPackageSchema");
const upload = require("../middleware/imageUploads"); // Adjust the path to your upload middleware
const fs = require("fs");
const path = require("path");
const Exclusion = require("../models/exclusionSchema");
const Inclusion = require("../models/inclusionSchema");
const Highlights = require("../models/highlightsSchema");

const updateTourFields = async (req, tour) => {
  tour.tourTitle = req.body.title || tour.tourTitle;
  tour.miniTourDesc = req.body.miniDesc || tour.miniTourDesc;
  tour.tourPrice = req.body.price || tour.tourPrice;
  tour.tourDurationDay = req.body.durationDay || tour.tourDurationDay;
  tour.tourDurationNight = req.body.durationNight || tour.tourDurationNight;
  tour.tourLocationCity = req.body.city || tour.tourLocationCity;
  tour.tourLocationState = req.body.state || tour.tourLocationState;
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

const updateItneryTour = async (req, itneryTourData, transaction) => {
  if (req.body.itneryTourDetails) {
    let parsedItneryTourDetails;
    try {
      parsedItneryTourDetails = JSON.parse(req.body.itneryTourDetails);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error("Invalid JSON format for itneryTourDetails.");
    }

    if (
      Array.isArray(parsedItneryTourDetails) &&
      parsedItneryTourDetails.length > 0
    ) {
      try {
        // Iterate over each itinerary and perform the update
        for (let i = 0; i < parsedItneryTourDetails.length; i++) {
          const itinerary = parsedItneryTourDetails[i];

          // Update the corresponding tour object
          if (itneryTourData[i]) {
            itneryTourData[i].title = itinerary.title;
            itneryTourData[i].desc = itinerary.desc;
            itneryTourData[i].day = itinerary.day;

            // Save the updated tour object to database
            await itneryTourData[i].save({ transaction });
          } else {
            console.error(
              `No corresponding ItneryTour found for itinerary index ${i}. Skipping update.`
            );
          }
        }

        // console.log("ItneryTour entries updated successfully.");
      } catch (error) {
        console.error("Error updating ItneryTour entries:", error);
        throw new Error("Error updating ItneryTour entries.");
      }
    } else {
      console.error("Invalid or empty itneryTourDetails array.");
      throw new Error("Invalid or empty itneryTourDetails array.");
    }
  }
};

const handleTourTitleImageUpload = async (
  req,
  tour,
  previousTourTitleImage,
  transaction
) => {
  if (req.files && req.files["TitleImage"]) {
    if (previousTourTitleImage) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        previousTourTitleImage
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete additional tour images files from server
      }
    }
    // Update tourTitleImage and save within transaction
    tour.tourTitleImage = req.files["TitleImage"][0].filename;
    await tour.save({ transaction });
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

    try {
      // Delete previous sub-images from the database
      await SubImages.destroy({ where: { tourId: tour.id }, transaction });
      // Create new sub-images in the database
      await SubImages.bulkCreate(newSubImages, { transaction });

      // Delete previous sub-image files from the filesystem
      if (previousSubImages.length > 0) {
        for (const image of previousSubImages) {
          const imagePath = path.join(
            __dirname,
            "..",
            "uploads",
            "images",
            image
          );
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Delete additional tour images files from server
          }
        }
      }
    } catch (error) {
      console.error("Error handling sub-images upload:", error);
      throw new Error("Error handling sub-images upload.");
    }
  }
};

const handleHighlightDetails = async (req, tourId, transaction) => {
  try {
    // Check if highlightsDetails is present in the request body
    if (req.body.highlightsDetails) {
      let parsedHighlightsDetails;

      // Parse the highlightDetails safely
      try {
        parsedHighlightsDetails = JSON.parse(req.body.highlightsDetails);
      } catch (error) {
        console.error("Invalid JSON format in highlightDetails:", error);
        throw new Error("Invalid JSON format in highlightDetails.");
      }

      // Check if parsedHighlightsDetails is a valid array
      if (
        !Array.isArray(parsedHighlightsDetails) ||
        parsedHighlightsDetails.length === 0
      ) {
        throw new Error("highlightDetails should be a non-empty array.");
      }

      // Delete all existing highlights for the given tourId
      await Highlights.destroy({ where: { tourId }, transaction });

      // Insert the new highlight details
      for (let parsedHighlight of parsedHighlightsDetails) {
        const { sl: serialNo, highlight } = parsedHighlight;

        // Basic validation on serialNo and highlight
        if (!serialNo || !highlight) {
          throw new Error("Each highlight must have a serialNo and highlight.");
        }

        // Create a new highlight
        await Highlights.create(
          {
            serialNo: serialNo,
            highlight: highlight,
            tourId: tourId,
          },
          { transaction } // Ensure it's part of the parent transaction
        );
      }

      console.log("Highlight details updated successfully.");
    } else {
      throw new Error("highlightDetails is required in the request body.");
    }
  } catch (error) {
    console.error("Error handling highlight details:", error);
    throw error; // Propagate the error to the parent function for handling
  }
};

const handleExclusionDetails = async (req, tourId, transaction) => {
  try {
    // Check if highlightsDetails is present in the request body
    if (req.body.exclusionDetails) {
      let parsedExclusionDetails;

      // Parse the highlightDetails safely
      try {
        parsedExclusionDetails = JSON.parse(req.body.exclusionDetails);
      } catch (error) {
        console.error("Invalid JSON format in highlightDetails:", error);
        throw new Error("Invalid JSON format in highlightDetails.");
      }

      // Check if parsedHighlightsDetails is a valid array
      if (
        !Array.isArray(parsedExclusionDetails) ||
        parsedExclusionDetails.length === 0
      ) {
        throw new Error("highlightDetails should be a non-empty array.");
      }

      // Delete all existing highlights for the given tourId
      await Exclusion.destroy({ where: { tourId }, transaction });

      // Insert the new highlight details
      for (let parsedExclusion of parsedExclusionDetails) {
        const { sl: serialNo, exclusion } = parsedExclusion;

        // Basic validation on serialNo and highlight
        if (!serialNo || !exclusion) {
          throw new Error("Each highlight must have a serialNo and highlight.");
        }

        // Create a new highlight
        await Exclusion.create(
          {
            serialNo: serialNo,
            exclusion: exclusion,
            tourId: tourId,
          },
          { transaction } // Ensure it's part of the parent transaction
        );
      }

      console.log("Highlight details updated successfully.");
    } else {
      throw new Error("highlightDetails is required in the request body.");
    }
  } catch (error) {
    console.error("Error handling highlight details:", error);
    throw error; // Propagate the error to the parent function for handling
  }
};

const handleInclusionDetails = async (req, tourId, transaction) => {
  try {
    // Check if highlightsDetails is present in the request body
    if (req.body.inclusionDetails) {
      let parsedInclusionDetails;

      // Parse the highlightDetails safely
      try {
        parsedInclusionDetails = JSON.parse(req.body.inclusionDetails);
      } catch (error) {
        console.error("Invalid JSON format in highlightDetails:", error);
        throw new Error("Invalid JSON format in highlightDetails.");
      }

      // Check if parsedHighlightsDetails is a valid array
      if (
        !Array.isArray(parsedInclusionDetails) ||
        parsedInclusionDetails.length === 0
      ) {
        throw new Error("highlightDetails should be a non-empty array.");
      }

      // Delete all existing highlights for the given tourId
      await Inclusion.destroy({ where: { tourId }, transaction });

      // Insert the new highlight details
      for (let parsedInclusion of parsedInclusionDetails) {
        const { sl: serialNo, inclusion } = parsedInclusion;

        // Basic validation on serialNo and highlight
        if (!serialNo || !inclusion) {
          throw new Error("Each highlight must have a serialNo and highlight.");
        }

        // Create a new highlight
        await Inclusion.create(
          {
            serialNo: serialNo,
            inclusion: inclusion,
            tourId: tourId,
          },
          { transaction } // Ensure it's part of the parent transaction
        );
      }

      console.log("Highlight details updated successfully.");
    } else {
      throw new Error("highlightDetails is required in the request body.");
    }
  } catch (error) {
    console.error("Error handling highlight details:", error);
    throw error; // Propagate the error to the parent function for handling
  }
};

const deleteUploadedFiles = (files) => {
  for (const file of files) {
    const filePath = path.join(__dirname, "..", "uploads", "images", file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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
      include: [
        { model: SubImages },
        { model: TourData },
        { model: Highlights },
        { model: Exclusion },
        { model: Inclusion },
      ],
      transaction,
    });

    const itneryTourData = await ItneryTour.findAll({
      where: { tourId: tourId },
      transaction,
    });

    const highlightDetails = await Highlights.findAll({
      where: { tourId: tourId },
      transaction,
    });

    const exclusionDetails = await Exclusion.findAll({
      where: { tourId: tourId },
      transaction,
    });

    const inclusionDetails = await Inclusion.findAll({
      where: { tourId: tourId },
      transaction,
    });

    if (!tour) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    } else if (!itneryTourData) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "ItneryTourData not found",
      });
    } else if (!highlightDetails) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Highlight not found",
      });
    } else if (!exclusionDetails) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Exclusion not found",
      });
    } else if (!inclusionDetails) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Inclusion not found",
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
        // Update itinerary tour fields
        await updateItneryTour(req, itneryTourData, transaction);
        // Handle title image upload
        await handleTourTitleImageUpload(
          req,
          tour,
          previousTourTitleImage,
          transaction
        );
        // Handle sub-images upload
        await handleSubImagesUpload(req, tour, previousSubImages, transaction);

        // Handle highlightDetails
        await handleHighlightDetails(req, tourId, transaction);

        // Handle exclusionDetails
        await handleExclusionDetails(req, tourId, transaction);

        // // Handle exclusionDetails
        await handleInclusionDetails(req, tourId, transaction);

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

        // Delete the newly uploaded images if any error occurs
        if (req.files && req.files["TitleImage"]) {
          deleteUploadedFiles([req.files["TitleImage"][0].filename]);
        }
        if (req.files && req.files["SubImages"]) {
          deleteUploadedFiles(
            req.files["SubImages"].map((file) => file.filename)
          );
        }

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
      city,
      state,
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
      highlightsDetails,
      exclusionDetails,
      inclusionDetails,
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
          tourLocationCity: city,
          tourLocationState: state,
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

      // itneryTourDetails is available then it should run
      if (itneryTourDetails) {
        let parsedItneryTourDetails = JSON.parse(itneryTourDetails);

        if (
          Array.isArray(parsedItneryTourDetails) &&
          parsedItneryTourDetails.length > 0
        ) {
          // Iterate over each itinerary and perform the update
          for (const itinerary of parsedItneryTourDetails) {
            const { title, desc, day } = itinerary;
            console.log(day);
            // return
            try {
              // Perform the update
              await ItneryTour.create(
                { title: title, desc: desc, day: day, tourId: newTour.id },
                { transaction }
              );
            } catch (updateError) {
              console.error(
                `Error updating ItneryTour entry with id :`,
                updateError
              );
              res.status(500).json({
                success: false,
                message: `Error updating ItneryTour entry with id :${updateError}`,
              });
            }
          }
          console.log("ItneryTour entries updated successfully.");
        } else {
          console.error("Invalid or empty ItneryTourDetails array.");
          res.status(500).json({
            success: false,
            message: "Invalid or empty ItneryTourDetails array.",
          });
        }
      }

      if (highlightsDetails) {
        let parsedHighlightsDetails = JSON.parse(highlightsDetails);

        if (
          Array.isArray(parsedHighlightsDetails) &&
          parsedHighlightsDetails.length > 0
        ) {
          // Iterate over each itinerary and perform the update
          for (const highlightObj of parsedHighlightsDetails) {
            const { sl: serialNo, highlight } = highlightObj;

            try {
              // Perform the update
              await Highlights.create(
                {
                  serialNo: serialNo,
                  highlight: highlight,
                  tourId: newTour.id,
                },
                { transaction }
              );
            } catch (updateError) {
              console.error(
                `Error updating ItineraryTour entry with serialNo: ${serialNo}`,
                updateError
              );
              res.status(500).json({
                success: false,
                message: `Error updating ItineraryTour entry with serialNo: ${serialNo}: ${updateError.message}`,
              });
              return;
            }
          }
          console.log("ItineraryTour highlights updated successfully.");
        } else {
          console.error(
            "Invalid or empty ItineraryTourDetails array for highlights."
          );
          res.status(500).json({
            success: false,
            message:
              "Invalid or empty ItineraryTourDetails array for highlights.",
          });
        }
      }

      if (exclusionDetails) {
        let parsedExclusionDetails = JSON.parse(exclusionDetails);

        if (
          Array.isArray(parsedExclusionDetails) &&
          parsedExclusionDetails.length > 0
        ) {
          // Iterate over each itinerary and perform the update for both Highlights and Exclusion
          for (const exclusionObj of parsedExclusionDetails) {
            const { sl: serialNo, exclusion } = exclusionObj;

            try {
              // Perform the update for Exclusion
              await Exclusion.create(
                {
                  serialNo: serialNo,
                  exclusion: exclusion,
                  tourId: newTour.id,
                },
                { transaction }
              );
            } catch (updateError) {
              console.error(
                `Error updating ItineraryTour entry with serialNo: ${serialNo}`,
                updateError
              );
              res.status(500).json({
                success: false,
                message: `Error updating ItineraryTour entry with serialNo: ${serialNo}: ${updateError.message}`,
              });
              return;
            }
          }
          console.log("ItineraryTour exclusions updated successfully.");
        } else {
          console.error(
            "Invalid or empty ItineraryTourDetails array for exclusions."
          );
          res.status(500).json({
            success: false,
            message:
              "Invalid or empty ItineraryTourDetails array for exclusions.",
          });
        }
      }

      if (inclusionDetails) {
        let parsedInclusionDetails = JSON.parse(inclusionDetails);

        if (
          Array.isArray(parsedInclusionDetails) &&
          parsedInclusionDetails.length > 0
        ) {
          // Iterate over each itinerary and perform the update
          for (const inclusionObj of parsedInclusionDetails) {
            const { sl: serialNo, inclusion } = inclusionObj;

            try {
              // Perform the update for Inclusion
              await Inclusion.create(
                {
                  serialNo: serialNo,
                  inclusion: inclusion,
                  tourId: newTour.id,
                },
                { transaction }
              );
            } catch (updateError) {
              console.error(
                `Error updating ItineraryTour entry with serialNo: ${serialNo}`,
                updateError
              );
              res.status(500).json({
                success: false,
                message: `Error updating ItineraryTour entry with serialNo: ${serialNo}: ${updateError.message}`,
              });
              return;
            }
          }
          console.log("ItineraryTour inclusions updated successfully.");
        } else {
          console.error(
            "Invalid or empty ItineraryTourDetails array for inclusions."
          );
          res.status(500).json({
            success: false,
            message:
              "Invalid or empty ItineraryTourDetails array for inclusions.",
          });
        }
      }

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

      // Delete the uploaded images if any error occurs
      if (tourTitleImage) {
        deleteUploadedFiles([tourTitleImage]);
      }
      if (tourImages.length > 0) {
        deleteUploadedFiles(tourImages);
      }

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
      include: [
        { model: SubImages },
        { model: TourData },
        { model: TourPackage },
        { model: Highlights },
        { model: Exclusion },
        { model: Inclusion },
      ],
    });

    const itneryTourData = await ItneryTour.findAll({
      where: { tourId: id },
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
      itneryTourData,
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
exports.getAllTours = async (req, res) => {
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
    const tour = await Tour.findByPk(tourId, {
      include: [{ model: SubImages }],
    });

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

    if (tour.SubImages && tour.SubImages.length > 0) {
      tour.SubImages.forEach((image) => {
        const imagePath = path.join(
          __dirname,
          "..",
          "uploads",
          "images",
          image.filename
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

//GET ALL TOP DEAL TOURS
exports.getAllTopTours = async (req, res) => {
  try {
    let tours = await Tour.findAll({
      where: { topDeals: true },
    });

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

//FETCH HOMEPAGE SECTION
exports.fetchHomePageSection = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findAll({
      where: { homePageSection: true },
      include: [
        {
          model: Tour,
          through: { attributes: [] }, // Exclude join table attributes
        },
      ],
    });
    res.status(200).json({
      success: true,
      message: "Tour packages found.",
      tourPackage,
    });
  } catch (error) {
    console.error("Error fetching tour packages:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error,
    });
  }

  //   const tourPackages = await Promise.all(
  //     tourPackageIdArray.map(async (tourPackageId) => {
  //       try {
  //         const tourPackage = await TourPackage.findOne({
  //           where: { id: tourPackageId, homePageSection: true },
  //           include: [
  //             {
  //               model: Tour,
  //               through: { attributes: [] }, // Exclude join table attributes
  //             },
  //           ],
  //         });

  //         // Limit the number of related tours to 3
  //         if (tourPackage) {
  //           const limitedTours = tourPackage.Tours.slice(0, 3);
  //           return {
  //             ...tourPackage.toJSON(),
  //             Tours: limitedTours,
  //           };
  //         }

  //         return null;
  //       } catch (error) {
  //         console.error(
  //           `Error fetching tour package with id ${tourPackageId}:`,
  //           error
  //         );
  //         return null;
  //       }
  //     })
  //   );

  //   const filteredTourPackages = tourPackages.filter(
  //     (tourPackage) => tourPackage !== null
  //   );

  //   if (filteredTourPackages.length === 0) {
  //     return res.status(200).json({});
  //   }

  //   res.status(200).json(filteredTourPackages);
  // } catch (error) {
  //   console.error("Error fetching home page section:", error);
  //   res.status(500).json({
  //     error: "An internal server error occurred while fetching tour packages.",
  //   });
  // }
};

//ADD TOURSPACKAGE TO HOMEPAGE SECTION
exports.addToHomePageSection = async (req, res) => {
  const tourPackageIdArray = req.body;
  console.log(req.body);
  if (!Array.isArray(tourPackageIdArray) || tourPackageIdArray.length === 0) {
    return res.status(400).json({
      error: "Invalid input: 'tourPackageIdArray' must be a non-empty array.",
    });
  }

  try {
    await Promise.all(
      tourPackageIdArray.map(async (tourPackageId) => {
        try {
          const tourPackage = await TourPackage.findOne({
            where: { id: tourPackageId },
          });
          if (!tourPackage) {
            console.warn(`Tour package with id ${tourPackageId} not found.`);
            return null;
          }

          // Update the homePageSection field to true
          tourPackage.homePageSection = true;
          await tourPackage.save();
        } catch (error) {
          console.error(
            `Error updating tour package with id ${tourPackageId}:`,
            error
          );
          return null;
        }
      })
    );

    res.status(200).json({ message: "Update Successfully" });
  } catch (error) {
    console.error("Error updating home page section:", error);
    res.status(500).json({
      error: "An internal server error occurred while updating tour packages.",
    });
  }
};

//REMOVE TOURSPACKAGE TO HOMEPAGE SECTION
exports.removeHomePageSection = async (req, res) => {
  const tourPackageIdArray = req.body;

  if (!Array.isArray(tourPackageIdArray) || tourPackageIdArray.length === 0) {
    return res.status(400).json({
      error: "Invalid input: 'tourPackageIdArray' must be a non-empty array.",
    });
  }

  try {
    await Promise.all(
      tourPackageIdArray.map(async (tourPackageId) => {
        try {
          const tourPackage = await TourPackage.findOne({
            where: { id: tourPackageId },
          });
          if (!tourPackage) {
            console.warn(`Tour package with id ${tourPackageId} not found.`);
            return null;
          }

          // Update the homePageSection field to true
          tourPackage.homePageSection = false;
          await tourPackage.save();
        } catch (error) {
          console.error(
            `Error updating tour package with id ${tourPackageId}:`,
            error
          );
          return null;
        }
      })
    );

    res.status(200).json({ message: "Update Successfully" });
  } catch (error) {
    console.error("Error updating home page section:", error);
    res.status(500).json({
      error: "An internal server error occurred while updating tour packages.",
    });
  }
};
