var title = 'f > '

switch (window.location.pathname) {
    case '/photos':
        document.title = title + 'Photos'
    break

    case '/elastic':
        document.title = title + 'Elastic Memories'
    break

    case '/poetry':
        document.title = title + 'Poetry'
    break

    case '/quotes':
        document.title = title + 'Quotes'
    break

    default:
        document.title = 'David Alexander Foster'
    break
}
window.addEventListener("orientationchange", function() {
    alert("the orientation of the device is now " + screen.orientation.angle);
});