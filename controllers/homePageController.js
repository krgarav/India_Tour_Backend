const homeSliderSchema = require("../models/HomeSliderSchema");
const fs = require("fs");
const path = require("path");
exports.addSliderData = async (req, res, next) => {
  const { Title, subTitle } = req.body;
  const imgBuffer = req.file.buffer; // Get the buffer of the uploaded file
  const imgPath = `sliderImage/${Date.now()}-${req.file.originalname}`; // Define the path where the image will be saved
  if (!fs.existsSync("sliderImage")) {
    fs.mkdirSync("sliderImage");
  }
  // Save the buffer to the filesystem
  fs.writeFile(imgPath, imgBuffer, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ msg: "Failed to save the image file", err });
    }

    try {
      const response = await homeSliderSchema.create({
        imgPath,
        Title,
        subTitle,
      });

      return res
        .status(200)
        .json({ msg: "Slider image data added successfully", data: response });
    } catch (error) {
      // If data addition fails, delete the uploaded file
      fs.unlink(imgPath, (unlinkErr) => {
        if (unlinkErr) {
          return res.status(500).json({
            msg: "Failed to delete the image file after data addition failed",
            err: unlinkErr,
          });
        }
        return res
          .status(500)
          .json({ msg: "Something went wrong in server", err: error });
      });
    }
  });
};
exports.deleteSliderDataasync =async(req, res, next) => {
    const { id } = req.params;
  
    try {
      // Find the document by ID
      const sliderData = await homeSliderSchema.findById(id);
  
      if (!sliderData) {
        return res.status(404).json({ msg: "Slider data not found" });
      }
  
      const imgPath = sliderData.imgPath;
  
      // Delete the document from the database
      await homeSliderSchema.findByIdAndDelete(id);
  
      // Delete the image file from the filesystem
      fs.unlink(imgPath, (unlinkErr) => {
        if (unlinkErr) {
          return res.status(500).json({ msg: "Failed to delete the image file", err: unlinkErr });
        }
  
        return res.status(200).json({ msg: "Slider data and image deleted successfully" });
      });
    } catch (error) {
      return res.status(500).json({ msg: "Something went wrong in server", err: error });
    }
  }