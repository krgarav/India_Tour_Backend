const express = require("express");
const { addMetaData, getMetaData, updateMetaData } = require("../controllers/metaController");
const router = express.Router();

router.post("/addmetadata", addMetaData);
router.get("/getmetadata",getMetaData)
router.put("/updatemetadata/:metaId",updateMetaData);
module.exports = router;
