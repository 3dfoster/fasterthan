var title = ' > Faster Than Me'

switch (window.location.pathname) {
    case '/photos':
        document.title = 'Photos' + title
    break

    case '/photos':
        document.title = 'Elastic Memories' + title
    break

    case '/blog':
        document.title = 'Blog' + title
    break

    default:
        document.title = 'Faster Than Me' + title
    break
}