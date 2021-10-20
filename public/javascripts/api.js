// this function should call your URL preview api endpoint 
// it should then call the displayPreviews() function and pass it 
// the html that was returned from the api endpoint. 
// if there was an error, call the displayPreviews() function with

// an error message and info from the error.
function getURLPreview(url){
    alert("Insert your code here to call the api and get a preview of " + url);
    fetch("api/v1/previewurl?previewurl=" + url)
    .then(response => response)
    .then(function(data) {
        // console.log(data)
        displayPreviews(data)
    })
    .catch((error) => {
        var error_msg = "An error occured " + error
        displayPreviews(error_msg)
    })

}
