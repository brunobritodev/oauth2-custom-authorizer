const fs = require('fs');
const lambdaLocal = require('lambda-local');
const path = require('path');

var jsonPayload = {
    'key': 1,
    'another_key': "Some text"
}

lambdaLocal.execute({
    event: fs.readFileSync(path.join(__dirname, '/test/event.json')),
    lambdaPath: path.join(__dirname, '/dist/handler.js'),
    profilePath: '~/.aws/credentials',
    profileName: 'default',
    timeoutMs: 3000,
    callback: function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    },
    clientContext: JSON.stringify({ clientId: 'xxxx' })
});