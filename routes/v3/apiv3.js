import express, { response } from 'express';
import mongoose from "mongoose"
import parser from 'node-html-parser';
let router = express.Router();
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import session, { Session } from 'express-session'

// const { MongoClient } = require('mongodb');

main().catch(err => console.log(err));

let Webpages;
let PostSchema;
let CommentSchema;
let UserSchema;

async function main() {
    const uri = "mongodb+srv://user2:123456A@cluster0.fye6b.mongodb.net/webPageSharer3?retryWrites=true&w=majority"
    await mongoose.connect(uri)
    const userSchema = new mongoose.Schema({
        username: String,
        icecream: String
    })
    const postSchema = new mongoose.Schema({
        url:String,
        description: String,
        username: String,
        likes: [String],
        date_created: Date
    })
    const commentSchema = new mongoose.Schema({
        username: String,
        comment: String,
        post: String,
        created_date: Date
    })
    // const webpageSchema = new mongoose.Schema({
    //     url: String,
    //     description: String,
    //     date_created: Date,
    //     favorite: String
    //   });
    // client = new MongoClient(uri)
    // await client.connect()
    PostSchema = mongoose.model('PostSchema', postSchema)
    CommentSchema = mongoose.model('CommentSchema', commentSchema)
    UserSchema = mongoose.model('UserSchema', userSchema)
}

router.get("/getIdentity", function(req, res, next){
    let session = req.session
    res.type("json")
    if (session.isAuthenticated){
        let result = {
            status: "loggedin",
            userInfo: {
                name: session.account.name,
                username: session.account.username
            }
        }
        res.send(result)
    } else {
        let result = { status: "loggedout" }
        res.send(result)
    }
})

router.post("/posts", async function(req, res, next) {   
    let session = req.session
    let date_ob = new Date()
    let date = ("0" + date_ob.getDate()).slice(-2)
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2)
    let year = date_ob.getFullYear()
    let currentDate = year + "-" + month + "-" + date
    try {
        const post = new PostSchema({
            url: req.body.url,
            description: req.body.description,
            username: session.account.username,
            date_created: new Date(currentDate),
            favorite: req.body.favorite
        });
        await post.save()
        res.send('added data')
    } catch(error){
        res.send("error info: " + error)
    }
})

// router.post("/posts", async function(req, res, next) {
//     let date_ob = new Date()
//     let date = ("0" + date_ob.getDate()).slice(-2)
//     let month = ("0" + (date_ob.getMonth() + 1)).slice(-2)
//     let year = date_ob.getFullYear()
//     let currentDate = year + "-" + month + "-" + date
//     try {
//         const newWebpage = new Webpages({
//             url: req.body.url,
//             description: req.body.description,
//             date_created: new Date(currentDate),
//             favorite: req.body.favorite
//         });
//         await newWebpage.save()
//         res.send('added data')
//     } catch(error){
//         res.send("error info: " + error)
//     }
// })

router.get("/posts", async function(req, res, next) {
    let allPages = await PostSchema.find()
    // console.log(allPages)
    let pages = await Promise.all(allPages.map(async function(pageInfo){
        var result_block = ''
        // let response = await fetch(pageInfo.url)
        // let data = await response.text()
        // console.log(data)
        let text = await getUrl(pageInfo.url)
        let data = getPreview(text, pageInfo.url)
        let resultDict = {
            username: pageInfo.username,
            id: pageInfo._id,
            description: pageInfo.description,
            htmlPreview: data,
            created_date: pageInfo.date_created,
            likes: pageInfo.likes
        }
        return resultDict
    }))
    res.send(pages)
})

async function getUrl(url) {
    const response = await fetch(url)
    const data = await response.text()
    return data
}

const escapeHTML = str => str.replace(/[&<>'"]/g, 
  tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));


function getPreview(data, url){
    let html_test = parser.parse(data)
    let og_url = html_test.querySelectorAll('meta[property="og:url"]')
    let og_title = html_test.querySelectorAll('meta[property="og:title"]')
    let og_image = html_test.querySelectorAll('meta[property="og:image"]')
    let og_description = html_test.querySelectorAll('meta[property="og:description"]')
    let has_image = og_image.length> 0
    let has_description = og_description.length>0
    let this_url = ""
    let this_title = ""
    let image_src = ""
    if (og_url.length == 0) {
        this_url = url
    } else {
        this_url = escapeHTML(og_url[0].attributes.content)
    }
    if (og_title.length!=0) {
        this_title = escapeHTML(og_title[0].attributes.content)
    } else {
        var title_replacement1 = html_test.querySelectorAll('title')
        if (title_replacement1.length!=0) {
            this_title = escapeHTML(title_replacement1[0].text)
        } else {
            this_title = url
        }
    }
    let title_html = "<p><strong>" + this_title + "</strong></p>"
    if (has_image) {
        image_src = escapeHTML(og_image[0].attributes.content)
        var url_html = "<a href=" + this_url + ">" + title_html + "<img src=" + image_src +' style="max-height: 200px; max-width: 270px;"></a>'
    } else {
        var url_html = "<a href=" + this_url + ">" + title_html + '</a>'
    }
    if (has_description) {
        let description = escapeHTML(og_description[0].attributes.content)
        console.log(description)
        var description_html = "<p>" + description + "</p>"
        url_html += description_html
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
        let og_url = html_test.querySelectorAll('meta[property="og:url"]')
        let og_title = html_test.querySelectorAll('meta[property="og:title"]')
        let og_image = html_test.querySelectorAll('meta[property="og:image"]')
        let og_description = html_test.querySelectorAll('meta[property="og:description"]')
        let has_image = og_image.length> 0
        let has_description = og_description.length>0
        let this_url = ""
        let this_title = ""
        let image_src = ""
        if (og_url.length == 0) {
            this_url = url
        } else {
            this_url = escapeHTML(og_url[0].attributes.content)
        }
        if (og_title.length!=0) {
            this_title = escapeHTML(og_title[0].attributes.content)
        } else {
            var title_replacement1 = html_test.querySelectorAll('title')
            if (title_replacement1.length!=0) {
                console.log("title")
                this_title = escapeHTML(title_replacement1[0].text)
            } else {
                this_title = url
            }
        }
        let title_html = "<p><strong>" + this_title + "</strong></p>"
        if (has_image) {
            image_src = escapeHTML(og_image[0].attributes.content)
            var url_html = "<a href=" + this_url + ">" + title_html + "<img src=" + image_src +' style="max-height: 200px; max-width: 270px;"></a>'
        } else {
            var url_html = "<a href=" + this_url + ">" + title_html + '</a>'
        }
        if (has_description) {
            let description = escapeHTML(og_description[0].attributes.content)
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

router.post('/likePost', async function (req, res, next){
    let session = req.session
    if (session.isAuthenticated == false) {
        res.type('json')
        res.send({
            status: 'error',
            error: "not logged in"
        })
    } else {
        try{
            let posts = await PostSchema.findById(req.body.postID)
            if (!posts.likes.includes(session.account.username)) {
                posts.likes.push(session.account.username)
            }
            let result = await posts.save()
            res.type('json')
            res.send({status: 'success'})
        }
        catch(err){
            res.json({
                status: 'error',
                error: err
            })
        }
    }
})

router.post('/unlikePost', async function (req, res, next) {
    let id = req.body.postID
    let session = req.session
    let username = session.account.username
    if (session.isAuthenticated == false) {
        res.type('json')
        res.send({
            status: 'error',
            error: "not logged in"
        })
    } else {
        try{
            let posts = await PostSchema.findById(req.body.postID)
            if (posts.likes.includes(session.account.username)) {
                let index = posts.likes.indexOf(username)
                posts.likes.splice(index, 1)
            }
            console.log(posts.likes)
            let result = await posts.save()
            res.type('json')
            res.send({status: 'success'})
        }
        catch(err) {
            res.json({
                status: 'error',
                error: err
            })
        }
    }
})

router.get("/comments", async function(req, res, next){
    // console.log(req.postID)
    try{
        let commentResults = await CommentSchema.find({"post": req.query.postID})
        let comments = await Promise.all(commentResults.map(async function(comment){
            var result_block = ''
            let resultDict = {
                check: req.body.postID,
                _id: comment._id,
                username: comment.username,
                comment: comment.comment,
                post: comment.post,
                created_date: comment.created_date
            }
            return resultDict
        }))
        res.send(comments)
    }catch(err){
        res.json({
            status: 'error',
            error: err
        })
    }
    
})

router.post('/comments', async function(req, res, next){
    let session = req.session
    let date_ob = new Date()
    let date = ("0" + date_ob.getDate()).slice(-2)
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2)
    let year = date_ob.getFullYear()
    let currentDate = year + "-" + month + "-" + date
    try {
        const comment = new CommentSchema({
            username: session.account.username,
            comment: req.body.newComment,
            post: req.body.postID,
            created_date: currentDate
        });
        let result = await comment.save()
        res.json({status: 'success'})
    }catch(err){
        res.json({
            status: 'error',
            error: err
        })
    }
})


router.get('/userPosts', async function(req, res, next){
    let user = req.query.username
    let allPages = await PostSchema.find({"username": user})
    let pages = await Promise.all(allPages.map(async function(pageInfo){
        var result_block = ''
        // let response = await fetch(pageInfo.url)
        // let data = await response.text()
        // console.log(data)
        let text = await getUrl(pageInfo.url)
        let data = getPreview(text, pageInfo.url)
        let resultDict = {
            username: pageInfo.username,
            id: pageInfo._id,
            description: pageInfo.description,
            htmlPreview: data,
            created_date: pageInfo.date_created,
            likes: pageInfo.likes
        }
        return resultDict
    }))
    res.send(pages)
})

router.delete('/posts', async function(req, res, next){
    let session = req.session
    if (!session.isAuthenticated){
        res.json({status: 'error', error: "not logged in"})
    } else {
        try {
            let username = req.session.account.username
            let postId = req.body.postID
            let post = await PostSchema.find({_id: postId})
            console.log(post[0].username)
            console.log(username)
            if (post[0].username!=username) {
                res.json({
                    status: 'error',
                    error: "you can only delete your own posts"
                 })
            }else {
                let deletedComment = await CommentSchema.deleteMany({"post": postId})
                let deletedPost = await PostSchema.deleteOne({_id: postId})
                res.json({status: 'success'})
            }
        }catch(err){
            res.json({
                status: 'error',
                error: err
            })
        }
    }
})

router.get('/iceCream', async function(req, res, next){
    let username = req.query.username
    let ice = await UserSchema.find({"username": username})
    let resultDict = {
        username: ice[0].username,
        ice: ice[0].icecream
    }
    res.send(resultDict)
})

router.post('/iceCream', async function(req, res, next){
    console.log(req.body.username)
    let username = req.body.username
    let previous = await UserSchema.find({"username": username})
    let result = {}
    console.log(previous)
    try{
        if (previous[0]==undefined){
            console.log("No")
            const ice = new UserSchema({
                username: username,
                icecream: req.body.iceCream
            })
            let result = await ice.save()
        }else{
            let deleted = await UserSchema.deleteOne({"username": username})
            const ice = new UserSchema({
                username: username,
                icecream: req.body.iceCream
            })
            let result = await ice.save()
        }
        res.json({
            status: "success"
        })
    } catch (err) {
        res.json({
            status: 'error',
            error: err
        })
    }
})



export default router