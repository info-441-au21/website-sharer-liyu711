import cookieParser from 'cookie-parser';
import express, { response } from 'express';
import parser from 'node-html-parser';
import meta_parser from 'html-metadata-parser';
let router = express.Router();
import fetch from 'node-fetch';

router.get("/previewurl", (req, res) => {
    var url = req.query.previewurl
    console.log(url)
    fetch(url)
    .then(response => response.text())
    .then(function(data) {
        let html_test = parser.parse(data)
        let metas = html_test.querySelectorAll('meta')
        for (let i = 0; i < metas.length; i++) {
            console.log(metas[i].attributes)
        }
        // let metas = html_test.querySelectorAll('head')
        // let infos = []
        // for (let i=0; i < metas.length; i++) {
        //     let meta = metas[i]
        //     let info = metas.attributes.property
        //     infos.push(info)
        // }
        // res.send(infos)
        // console.log(metas.length)
        res.send('string')
    })
    .catch(error => {
        // console.log(error)
        console.log('Error is ' + error)
    })
})

export default router