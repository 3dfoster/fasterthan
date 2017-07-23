var title = 'f> '

switch (window.location.pathname) {
    case '/photos':
        document.title = title + 'Photos'
    break

    case '/photos':
        document.title = title + 'Elastic Memories'
    break

    case '/blog':
        document.title = title + 'Blog'
    break

    default:
        document.title = title + 'Faster Than Me'
    break
}