const express = require('express');
const clova = require('../clova');
const router = express.Router();

router.post(`/`, clova);

module.exports = router;
