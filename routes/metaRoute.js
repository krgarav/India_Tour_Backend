const express = require("express");
const { addMetaData } = require("../controllers/metaController");
const router = express.Router();

router.post("/addmetadata", addMetaData);
module.exports = router;
