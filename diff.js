var diff = require('image-diff');

diff({
    actualImage: 'github.features.png',
    expectedImage: 'github.png',
    diffImage: 'difference.png'
}, function (err, same) {
    console.log('error: %s', err);
    console.log('same: %s', same);
});
