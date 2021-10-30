const apiVersion = "v2"


// this function should call your URL preview api endpoint 
// and return an html string with the preview
async function getURLPreview(url){
    try{
        let response = await fetch(`api/${apiVersion}/previewurl?url=${url}`);
        let responseText = await response.text();
        return responseText;
    }catch(error){
        return "There was an error: " + error;
    }
}

async function loadPostsApi(){
    let response = await fetch(`api/${apiVersion}/posts`);
    let postsJson = await response.json();
    console.log(response.body)
    return postsJson;
}

async function postUrlApi(url, description, favorite){
    const myData = {url: url, description: description, favorite: favorite};
    let status = await fetch(`api/${apiVersion}/posts`,
        {
            method: "POST",
            body: JSON.stringify(myData),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
    return status;
}