var fs = require('fs')
var request = require('request')
var DOWNLOAD_DIR = './downloads/'


var downloadFile = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
        if (err)
            callback(err, filename);
        else {
            var stream = request(uri);

            if (!fs.existsSync(DOWNLOAD_DIR)) {
                fs.mkdirSync(DOWNLOAD_DIR);
            }

            stream.pipe(
                    fs.createWriteStream(DOWNLOAD_DIR + filename)
                    .on('error', function(err) {
                        callback(error, filename);
                        stream.read();
                    })
                )
                .on('close', function() {
                    callback(null, filename);
                });
        }
    });
};

var generateRandomFileName = function() {
    var randomFileName = '';
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        randomFileName += possible.charAt(Math.floor(Math.random() * possible.length));
    // randomFileName += ".jpg";
    return randomFileName
}

exports.downloadFile = downloadFile
exports.generateRandomFileName = generateRandomFileName
exports.DOWNLOAD_DIR = DOWNLOAD_DIR
