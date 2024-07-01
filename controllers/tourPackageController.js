const sequelize = require("../utils/database");
const TourPackage = require("../models/tourPackageSchema");
const upload = require("../middleware/imageUploads"); // Adjust the path to your upload middleware

//CREATE TOUR PACKAGE
exports.createTourPackage = async (req, res) => {
  upload(req, res, async (err) =>{
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

      // Map the tourPackageData
      const tourPackageData = toursArray.map((tourId) => ({
        packageTitle: tourPackageTitle,
        backgroundImage: tourPackageBgImageName,
        tourId,
      }));

      // Bulk create the tour packages
      await TourPackage.bulkCreate(tourPackageData, { transaction });

      // Commit the transaction
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

//EDIT TOUR PACKAGE
// exports.editTourPackage = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({
//         success: false,
//         message: err.message,
//       });
//     }
//     const tourId = req.params.id;
//     const { tourPackageTitle, toursIncluded } = req.body;

//     // Extract tourPackageImage filename
//     const tourPackageBgImageName =
//       req.files?.tourPackageImage?.[0]?.filename || null;

//     let transaction;

//     try {
//       transaction = await sequelize.transaction();

//       // Parse toursIncluded if it's a string (e.g., if sent as JSON)
//       const toursArray =
//         typeof toursIncluded === "string"
//           ? JSON.parse(toursIncluded)
//           : toursIncluded;

//       // Validate that toursArray is an array
//       if (!Array.isArray(toursArray) || toursArray.length === 0) {
//         await transaction.rollback();
//         return res.status(400).json({
//           success: false,
//           message: "Invalid or empty Tours Included array.",
//         });
//       }

//       // Map the tourPackageData
//       const tourPackageData = toursArray.map((tourId) => ({
//         packageTitle: tourPackageTitle,
//         backgroundImage: tourPackageBgImageName,
//         tourId,
//       }));

//       await TourPackage.findByPk({where:{id: tourId}})

//       // Bulk create the tour packages
//       await TourPackage.bulkCreate(tourPackageData, { transaction });

//       // Commit the transaction
//       await transaction.commit();

//       res.status(200).json({
//         success: true,
//         message: "Tour packages created successfully.",
//       });
//     } catch (error) {
//       if (transaction) await transaction.rollback();
//       console.error("Error creating tour packages:", error);
//       res.status(500).json({
//         success: false,
//         message: "Server error. Please try again later.",
//       });
//     }
//   });
// };
