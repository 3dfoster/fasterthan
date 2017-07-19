
// function signup() {
//     var main = document.getElementsByTagName('main')[0]
//     var quote = document.getElementById('input')
//     var quoteForm = document.getElementById('form')

//     if (!quote.value)
//         quote.placeholder = "Enter your IG account"

//     else {
//         var httpRequest = new XMLHttpRequest()

//         // Retrieve data in quote input field and convert to lower case
//         // This function gets called once httprequest.send has sent data to the server AND we received a response back form the server (res.send)
//         httpRequest.onreadystatechange = function () {
//         if (this.readyState == 4 && this.status == 200) {
//             // Disable submit button after quote has successfully been sent
//             quote.innerText = this.response
            
//             document.getElementById('submit_button').disabled = true
//             document.getElementById('form').reset()
//             document.getElementById('input').placeholder = this.response
//         }
//         }
//         httpRequest.open('POST', '/elastic/signup')
//         // Setting request header is required
//         httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
//         // Send quote to server
//         httpRequest.send(quote.value)
//         document.getElementById('form').reset()
//         document.getElementById('input').placeholder = "Submitting request..."
//     }
// }