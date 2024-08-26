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
