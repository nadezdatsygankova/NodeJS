const express = require("express");
const router = express.Router();



// "/purchase"
router.post('/', (req, res) => {
    let bodyn = req.body.buy;
    console.log(bodyn);


    res.redirect('/purchaseC');
});


module.exports = router;