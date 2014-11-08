var load = require('./screener');

load('http://localhost:9000', function (snapshot) {
    snapshot('div css test 0', function () {
        $('div').css('border', '1px solid red');
    });
});

load('http://localhost:9000', function (snapshot) {
    snapshot('div css test 1', function () {
        $('div').css('border', '1px solid red');
    });
});

load('http://localhost:9000', function (snapshot) {
    snapshot('div css test 2', function () {
        $('div').css('border', '1px solid red');
    });
});
