import express from 'express';
var router = express.Router();

router.get("/previewurl", (req, res) => {
    var url = req.query.url
    res.send(url)
})

export default router