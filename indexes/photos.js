request('/david', 'GET', function(Person) {
  loadPage(Person)
})
request('/photos', 'GET', function(_photos) {
  photos(_photos)
})
Ticker.addQuote("Memories, reverberating across the echo chamber of my mind...")