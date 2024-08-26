const Keyword = require("../models/keySchema");
const Meta = require("../models/keywordSchema");

exports.addMetaData = async (req, res) => {
    try {
        const { description, keyword, pageId, label } = req.body;

        // Validate required fields
        if (!description || !keyword || !pageId || !label) {
            return res.status(400).json({
                success: false,
                message: "Description, keyword, and pageId are required.",
            });
        }
        // Check if a Meta entry with the same label and pageId already exists
        const existingMeta = await Meta.findOne({
            where: {
                label,
                pageId
            }
        });

        if (existingMeta) {
            return res.status(400).json({
                success: false,
                message: "Meta data for the page already exists.",
            });
        }
        // Create new metadata entry
        const metaData = await Meta.create({
            label,
            description,
            pageId,
        });
        // Insert associated keywords
        if (Array.isArray(keyword)) {
            const keywordEntries = keyword.map((kw) => ({
                keyword: kw,
                // metaId: metaData.id, // Link keyword to the Meta entry
            }));
            // Bulk create new Keywords
            const createdKeywords = await Keyword.bulkCreate(keywordEntries);

            // Use the addKeywords method to link the created Keywords to the Meta
            await metaData.addKeywords(createdKeywords);
            // await Keyword.bulkCreate(keywordEntries); // Efficiently create multiple entries
        } else {
            throw new Error("Keyword is not array")
        }
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


exports.getMetaData = async (req, res) => {
    try {
        const { label, pageId } = req.query;

        // Log the label and pageId for debugging purposes
        console.log(label, pageId);

        // Find the Meta entry with the provided label and pageId
        const data = await Meta.findOne({
            where: {
                label: label,
                pageId: pageId
            }
        });

        // If Meta data is found, fetch associated keywords
        if (data) {
            const keywords = await Keyword.findAll({
                where: {
                    metaId: data.id
                },
                attributes: ["id", "keyword"]
            });

            // Return the Meta data along with associated keywords
            return res.status(200).json({
                message: "Data found",
                data: {
                    ...data.toJSON(), // Convert Meta instance to plain object
                    keywords: keywords // Extract only the keyword strings
                }
            });
        } else {
            // If no Meta data is found, return a 404 response
            return res.status(404).json({
                success: false,
                message: "No data found for the specified label and pageId."
            });
        }
    } catch (error) {
        // Handle any errors that occur during the database queries
        console.error("Error fetching metadata:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching metadata."
        });
    }
};
exports.updateMetaData = async (req, res) => {
    try {
        const { metaId } = req.params;
        const { description, keyword, pageId, label } = req.body;

        // Validate required fields
        if (!description || !keyword || !pageId || !label) {
            return res.status(400).json({
                success: false,
                message: "Description, keyword, pageId, and label are required.",
            });
        }

        // Find the existing Meta entry by metaId
        const metaData = await Meta.findByPk(metaId);

        if (!metaData) {
            return res.status(404).json({
                success: false,
                message: "Meta data not found.",
            });
        }

        // Update the Meta entry
        await metaData.update({
            label,
            description,
            pageId,
        });

        // Update the associated keywords if they are provided
        if (Array.isArray(keyword)) {
            // Delete existing keywords associated with this Meta entry
            await Keyword.destroy({
                where: { metaId: metaData.id }
            });

            // Create new keyword entries
            const keywordEntries = keyword.map((kw) => ({
                keyword: kw,
                metaId: metaData.id,
            }));

            // Bulk create the new keywords
            await Keyword.bulkCreate(keywordEntries);
        } else {
            return res.status(400).json({
                success: false,
                message: "Keyword should be an array.",
            });
        }

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Meta data updated successfully.",
        });
    } catch (error) {
        console.error("Error updating meta data:", error);

        // Send error response
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating meta data.",
            error: error.message,
        });
    }
};
