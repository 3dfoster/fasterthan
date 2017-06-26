
request('/david', 'GET', function(Person) {
  loadPage(Person)
})
request('/resume', 'GET', function(resume) {
  home(resume)
})
request('/quotes/faster', 'GET', function(quote) {
  Ticker.addQuote(quote)
})