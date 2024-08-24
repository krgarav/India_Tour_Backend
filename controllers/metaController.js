const Meta = require("../models/keywordSchema");

exports.addMetaData = async (req, res) => {
    try {
        const { description, keyword, pageId } = req.body;

        // Validate required fields
        if (!description || !keyword || !pageId) {
            return res.status(400).json({
                success: false,
                message: "Description, keyword, and pageId are required.",
            });
        }

        // Create new metadata entry
        const metaData = await Meta.create({
            description,
            keyword,
            pageId,
        });

        // Send success response
        return res.status(201).json({
            success: true,
            message: "Meta data saved successfully.",
        });
    } catch (error) {
        console.error("Error saving meta data:", error);

        // Send error response
        return res.status(500).json({
            success: false,
            message: "An error occurred while saving meta data.",
            error: error.message,
        });
    }
};
