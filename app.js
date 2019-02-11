var express = require('express');
var bodyParser = require('body-parser');
var couchbase = require('couchbase');
var FCM = require('fcm-node');
var serverKey = "AAAALN0pKyQ:APA91bEgbmmi4_A9wvhpV0OwgNrzwx0lwSkKD7THTyZ-gmS8GBvXuE7lRodJaJpmlsb91s3OioYgB1GqxSNaL1pskyVtPn6v4XVwZlmZiPfTonMgATQjGFbx-IGOg-thGjDuyXPmXsj3";
var fcm = new FCM(serverKey);
var fs = require('fs');


var obj = {
    tokens: []
};

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Enable CORS from client side
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT,GET,DELETE,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With,Content-Type, Accept, Authorization,' +
        ' Access-Control-Allow-Credential');
    res.header('Access-Control-Allow-Credentials', 'true');

    next();
});

var cluster = new couchbase.Cluster('couchbase://localhost');
cluster.authenticate('demo', '123456');
var bucket = cluster.openBucket('product', function (err) {
    if (err) {
        console.log('Bucket connection failed', err);
        return;
    }
    console.log(bucket._name)
    console.log('Connected to Couchbase!');
});
module.exports.bucket = bucket;

// require('./routes/detail')(app);
// require('./routes/type')(app);

app.post("/notify", (request, response) => {
    fs.exists('tokenjsonfile.json', function (exists) {
        if (exists) {
            fs.readFile('tokenjsonfile.json', function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    obj = JSON.parse(data);
                    console.log(obj);
                    for (var i = 0; i < obj.tokens.length; i++) {
                        sendNotification(i, response, obj.tokens[i]);
                    }
                }
            });
        }
    });
});



function sendNotification(_i, response, _token) {
    // var token = "ev7ZT5nDkW8:APA91bFuxC-XrAjrOBAe-VUmV97nK6NNmhPF3uCWr2iOvWSMS8BBrjaKOfB_27Po10OlC6R5lWnDNK4RRMdnjMKvwf2neKZ2pGZOb8srhjhz0CjkiqLQ-BF3a8FbkUd_uyCvaHu5ESVn";
    console.log("sendNotification" + _token);
    var message = {
        to: _token,
        notification: {
            title: "Couchbase POC", //title of notification 
            body: "Product docment added/updated", //content of the notification
            sound: "default",
            icon: "ic_launcher" //default notification icon
        },
        data: {
            testdata: "Product docment added/updated"
        } //payload you want to send with your notification
    };
    fcm.send(message, function (err, res) {
        if (err) {
            console.log("Notification not sent " + err + " | " + _i);
            // if (_i == 0) {
            //     response.status(200);
            //     return response.send({ "status": "error", "response": err });
            // }

        } else {
            console.log("Successfully sent with response: " + res + " | " + _i);
            // if (_i == 0) {
            //     response.status(200);
            //     return response.send({ "status": "success", "response": res });
            // }
        }
    });


}

app.post("/save_token", (request, response) => {
    var token = request.body.token;
    fs.exists('tokenjsonfile.json', function (exists) {
        if (exists) {
            fs.readFile('tokenjsonfile.json', function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                    response.status(401);
                    return response.send({ "statuscode": 401, "status": "error to save token" });
                } else {
                    obj = JSON.parse(data);
                    obj.tokens.push(token);
                    var json = JSON.stringify(obj);
                    fs.writeFile('tokenjsonfile.json', json, 'utf8', function (e, r) {
                        if (e) {
                            console.log(e);
                            response.status(401);
                            return response.send({
                                "statuscode": 401, "status": "error to save token"
                            });
                        }
                        response.status(200);
                        return response.send({ "statuscode": 200, "status": "successfully saved" });
                    });
                }
            });
        } else {
            obj.tokens.push(token);
            var json = JSON.stringify(obj);
            fs.writeFile('tokenjsonfile.json', json, 'utf8', function (e, r) {
                if (e) {
                    console.log(e);
                    response.status(401);
                    return response.send({ "statuscode": 401, "status": "error to save token" });
                }
                response.status(200);
                return response.send({ "statuscode": 200, "status": "successfully saved" });
            });
        }
    });

});

var server = app.listen(3000, function () {
    console.log('Listening on port %s...' + server.address().port);
});

