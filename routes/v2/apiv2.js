import express, { response } from 'express';
import mongoose from "mongoose"
import parser from 'node-html-parser';
let router = express.Router();
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

// const { MongoClient } = require('mongodb');
// console.log("test")
main().catch(err => console.log(err));

let Webpages;

async function main() {
    const uri = "mongodb+srv://user2:123456A@cluster0.fye6b.mongodb.net/webPageSharer?retryWrites=true&w=majority"
    await mongoose.connect(uri)
    const webpageSchema = new mongoose.Schema({
        url: String,
        description: String,
        date_created: Date,
        favorite: String
      });
    // client = new MongoClient(uri)
    // await client.connect()
    Webpages = mongoose.model('Webpages', webpageSchema)
    // console.log(Webpages)
}


router.post("/posts", async function(req, res, next) {
    let date_ob = new Date()
    let date = ("0" + date_ob.getDate()).slice(-2)
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2)
    let year = date_ob.getFullYear()
    let currentDate = year + "-" + month + "-" + date
    try {
        const newWebpage = new Webpages({
            url: req.body.url,
            description: req.body.description,
            date_created: new Date(currentDate),
            favorite: req.body.favorite
        });
        await newWebpage.save()
        res.send('added data')
    } catch(error){
        res.send("error info: " + error)
    }
})

router.get("/posts", async function(req, res, next) {
    let allPages = await Webpages.find()
    let pages = await Promise.all(allPages.map(async function(pageInfo){
        var result_block = ''
        // let response = await fetch(pageInfo.url)
        // let data = await response.text()
        // console.log(data)
        let text = await getUrl(pageInfo.url)
        let data = getPreview(text, pageInfo.url, pageInfo.favorite)
        let resultDict = {
            description: pageInfo.description,
            htmlPreview: data
        }
        return resultDict
        // console.log(data)
    }))
    res.send(pages)
})

async function getUrl(url) {
    const response = await fetch(url)
    const data = await response.text()
    return data
}


function getPreview(data, url, favoriteText){
    let html_test = parser.parse(data)
    var charsets = html_test.querySelectorAll('meta[charset]')
    let og_url = html_test.querySelectorAll('meta[property="og:url"]')
    let og_title = html_test.querySelectorAll('meta[property="og:title"]')
    let og_image = html_test.querySelectorAll('meta[property="og:image"]')
    let og_description = html_test.querySelectorAll('meta[property="og:description"]')
    let has_image = og_image.length> 0
    let has_description = og_description.length>0
    let has_charset = charsets.length !=0
    let this_url = ""
    let this_title = ""
    let image_src = ""
    if (og_url.length == 0) {
        this_url = url
    } else {
        this_url = og_url[0].attributes.content
    }
    if (og_title.length!=0) {
        this_title = og_title[0].attributes.content
    } else {
        var title_replacement1 = html_test.querySelectorAll('title')
        if (title_replacement1.length!=0) {
            this_title = title_replacement1[0].text
        } else {
            this_title = url
        }
    }
    let title_html = "<p><strong>" + this_title + "</strong></p>"
    if (has_image) {
        image_src = og_image[0].attributes.content
        var url_html = "<a href=" + this_url + ">" + title_html + "<img src=" + image_src +' style="max-height: 200px; max-width: 270px;"></a>'
    } else {
        var url_html = "<a href=" + this_url + ">" + title_html + '</a>'
    }
    if (has_charset) {
        let charset1 = charsets[0].attributes.charset
        let charset2 = charsets[0].attributes.charSet
        if (charset1 == undefined) {
            var charset_html = "<h5>Character set of this website is: " + charset2+ "</h5>"
        } else {
            var charset_html = "<h5>Character set of this website is: " + charset1+ "</h5>"
        }
        url_html += charset_html
    } 
    if (has_description) {
        let description = og_description[0].attributes.content
        var description_html = "<p>" + description + "</p>"
        url_html += description_html
    }
    if (typeof favoriteText !== 'undefined'){
        var favorite_html = "<p>" + favoriteText + "</p>"
        url_html += favorite_html
    }
    let result_block = '<div style="max-width: 300px; border: solid 1px; padding: 3px; text-align: center; background-color: F4E6E4">' + url_html + '</div>'
    // console.log(result_block)
    return result_block
    }



router.get("/previewurl", (req, res) => {
    var url = req.query.url
    fetch(url)
    .then(response => response.text())
    .then(function(data) {
        let html_test = parser.parse(data)
        var charsets = html_test.querySelectorAll('meta[charset]')
        let og_url = html_test.querySelectorAll('meta[property="og:url"]')
        let og_title = html_test.querySelectorAll('meta[property="og:title"]')
        let og_image = html_test.querySelectorAll('meta[property="og:image"]')
        let og_description = html_test.querySelectorAll('meta[property="og:description"]')
        let has_image = og_image.length> 0
        let has_description = og_description.length>0
        let has_charset = charsets.length !=0
        let this_url = ""
        let this_title = ""
        let image_src = ""
        if (og_url.length == 0) {
            this_url = url
        } else {
            this_url = og_url[0].attributes.content
        }
        if (og_title.length!=0) {
            this_title = og_title[0].attributes.content
        } else {
            var title_replacement1 = html_test.querySelectorAll('title')
            if (title_replacement1.length!=0) {
                this_title = title_replacement1[0].text
            } else {
                this_title = url
            }
        }
        let title_html = "<p><strong>" + this_title + "</strong></p>"
        if (has_image) {
            image_src = og_image[0].attributes.content
            var url_html = "<a href=" + this_url + ">" + title_html + "<img src=" + image_src +' style="max-height: 200px; max-width: 270px;"></a>'
        } else {
            var url_html = "<a href=" + this_url + ">" + title_html + '</a>'
        }
        if (has_charset) {
            let charset1 = charsets[0].attributes.charset
            let charset2 = charsets[0].attributes.charSet
            if (charset1 == undefined) {
                var charset_html = "<h5>Character set of this website is: " + charset2+ "</h5>"
            } else {
                var charset_html = "<h5>Character set of this website is: " + charset1+ "</h5>"
            }
            url_html += charset_html
        } 
        if (has_description) {
            let description = og_description[0].attributes.content
            var description_html = "<p>" + description + "</p>"
            url_html += description_html
        }
        let result_block = '<div style="max-width: 300px; border: solid 1px; padding: 3px; text-align: center; background-color: F4E6E4">' + url_html + '</div>'
        res.type('html')
        // console.log(charsets[0])
        var testing_string = '<div style="max-width: 300px; border: solid 1px; padding: 3px; text-align: center;"><a href="https://www.imdb.com/title/tt3281548/"><p><strong>Little Women (2019) - IMDb</strong></p><img src="https://m.media-amazon.com/images/M/MV5BY2QzYTQyYzItMzAwYi00YjZlLThjNTUtNzMyMDdkYzJiNWM4XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX1000_.jpg" style="max-height: 200px; max-width: 270px;"></a><p>Little Women: Directed by Greta Gerwig. With Saoirse Ronan, Emma Watson, Florence Pugh, Eliza Scanlen. Jo March reflects back and forth on her life, telling the beloved story of the March sisters - four young women, each determined to live life on her own terms.</p></div>'
        res.send(result_block)
    })
    .catch(error => {
        // console.log(error)
        console.log('Error is ' + error)
    })
})
export default router