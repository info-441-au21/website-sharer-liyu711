import cookieParser from 'cookie-parser';
import express, { response } from 'express';
import parser from 'node-html-parser';
let router = express.Router();
import fetch from 'node-fetch';

router.get("/previewurl", (req, res) => {
    var url = req.query.previewurl
    fetch(url)
    .then(response => response.text())
    .then(function(data) {
        let html_test = parser.parse(data)
        let og_url = html_test.querySelectorAll('meta[property="og:url"]')
        let og_title = html_test.querySelectorAll('meta[property="og:title"]')
        let og_image = html_test.querySelectorAll('meta[property="og:image"]')
        let og_description = html_test.querySelectorAll('meta[property="og:description"]')
        let has_image = og_image.length!= 0
        let has_description = og_description.length!=0
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
        if (has_description) {
            let description = og_description[0].attributes.content
            var description_html = "<p>" + description + "</p>"
            url_html += description_html
        }
        let result_block = '<div style="max-width: 300px; border: solid 1px; padding: 3px; text-align: center;">' + url_html + '</div>'
        res.type('html')

        var testing_string = '<div style="max-width: 300px; border: solid 1px; padding: 3px; text-align: center;"><a href="https://www.imdb.com/title/tt3281548/"><p><strong>Little Women (2019) - IMDb</strong></p><img src="https://m.media-amazon.com/images/M/MV5BY2QzYTQyYzItMzAwYi00YjZlLThjNTUtNzMyMDdkYzJiNWM4XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX1000_.jpg" style="max-height: 200px; max-width: 270px;"></a><p>Little Women: Directed by Greta Gerwig. With Saoirse Ronan, Emma Watson, Florence Pugh, Eliza Scanlen. Jo March reflects back and forth on her life, telling the beloved story of the March sisters - four young women, each determined to live life on her own terms.</p></div>'
        res.send(result_block)
    })
    .catch(error => {
        // console.log(error)
        console.log('Error is ' + error)
    })
})

export default router