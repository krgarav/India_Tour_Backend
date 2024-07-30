const homeSliderSchema = require("../models/HomeSliderSchema");
const fs = require("fs");
const path = require("path");
exports.addSliderData = async (req, res, next) => {
  const { Title, subTitle } = req.body;
  console.log(Title, subTitle);

  if (!Title || !subTitle || !req.file) {
    return res
      .status(400)
      .json("please upload all three dta(title,subtitle and image)");
  }
  const imgBuffer = req.file.buffer; // Get the buffer of the uploaded file
  const appendedFileName = `${Date.now()}-${req.file.originalname}`; //created current time and original name mixed title
  const imgPath = `uploads/sliderImage/${appendedFileName}`; // Define the path where the image will be saved
  if (!fs.existsSync("upload/sliderImage")) {
    fs.mkdirSync("uploads/sliderImage", { recursive: true });
  }
  // Save the buffer to the filesystem
  fs.writeFile(imgPath, imgBuffer, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ msg: "Failed to save the image file", err });
    }

    try {
      console.log(appendedFileName);
      const response = await homeSliderSchema.create({
        imgPath: appendedFileName,
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
exports.deleteSliderData = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the document by ID
    const sliderData = await homeSliderSchema.findOne({ where: { id: id } });

    if (!sliderData) {
      return res.status(404).json({ msg: "Slider data not found" });
    }

    const imgPath = `uploads/sliderImage/${sliderData.imgPath}`;

    // Delete the document from the database
    await sliderData.destroy();

    // Delete the image file from the filesystem
    fs.unlink(imgPath, (unlinkErr) => {
      if (unlinkErr) {
        return res
          .status(500)
          .json({ msg: "Failed to delete the image file", err: unlinkErr });
      }

      return res
        .status(200)
        .json({ msg: "Slider data and image deleted successfully" });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Something went wrong in server", err: error });
  }
};

exports.editSliderData = async (req, res, next) => {
  // const { id } = req.params;
  const { Title, subTitle, id } = req.body;
  console.log(Title, subTitle, id);
  // return;
  if (!Title || !subTitle || !req.file) {
    return res
      .status(400)
      .json(
        "Please provide all four data (title, subtitle,id and image) for editing"
      );
  }

  
  try {
    // Find the document by ID
    const sliderData = await homeSliderSchema.findOne({ where: { id: id } });
    console.log(sliderData);
    if (!sliderData) {
      return res.status(404).json({ msg: "Slider data not found" });
    }

    const oldImgPath = `uploads/sliderImage/${sliderData.imgPath}`;

    // Delete the old image file from the filesystem
    fs.unlink(oldImgPath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Failed to delete the old image file", unlinkErr);
      }
    });

    // Save the new image
    const imgBuffer = req.file.buffer;
    const appendedFileName = `${Date.now()}-${req.file.originalname}`;
    const newImgPath = `sliderImage/${appendedFileName}`;

    if (!fs.existsSync("uploads/sliderImage")) {
      fs.mkdirSync("uploads/sliderImage", { recursive: true });
    }

    fs.writeFile(newImgPath, imgBuffer, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ msg: "Failed to save the new image file", err });
      }

      // Update the document in the database
      sliderData.imgPath = appendedFileName;
      sliderData.Title = Title;
      sliderData.subTitle = subTitle;

      await sliderData.save();

      return res
        .status(200)
        .json({ msg: "Slider data updated successfully", data: sliderData });
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Something went wrong in server", err: error });
  }
};
exports.getAllSliderData = async (req, res, next) => {
  try {
    const sliderData = await homeSliderSchema.findAll();
    return res.status(200).json({ data: sliderData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Something went wrong in server", err: error });
  }
};
