
const express = require("express");
const router = express.Router();

router.get('/', function (req, res) {
    req.MySession.reset();
    name = "";
    res.redirect('/reset');
});

module.exports = router;