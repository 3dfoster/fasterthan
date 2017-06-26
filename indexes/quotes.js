request('/david', 'GET', function(Person) {
  loadPage(Person)
})
request('/quotes', 'GET', function(_quotes) {
  quotes(_quotes)
})      
request('/quotes/faster', 'GET', function(quote) {
  Ticker.addQuote(quote)
})