
request('/darkness', 'GET', function(Person) {
  loadPage(Person)
})
request('/elastic-memories', 'GET', function(bubbles) {
  elastic(bubbles)
})
request('/quotes/faster', 'GET', function(quote) {
  Ticker.addQuote(quote)
})