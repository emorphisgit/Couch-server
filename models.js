var uuid = require('uuid');
var N1qlQuery = require('couchbase').N1qlQuery;
var bucket = require('./app').bucket;

function PersonModel() { }


PersonModel.getAll = function (callback) {
    console.log('fffffff' + bucket._name);
    var statement = "SELECT " +
        "META(person).id, person.name, person.email, " +
        "(SELECT timestamp, message FROM `" + bucket._name + "` USE KEYS person.comments) AS comments " +
        "FROM `" + bucket._name + "` AS person " +
        "WHERE person.type = 'person' "
    var query = N1qlQuery.fromString(statement);
    bucket.query(query, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result);
    });
}

PersonModel.getById = function (data, callback) {
    bucket.get(data.id, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result.value);
    });
}

PersonModel.save = function (data, callback) {
    var person = {
        name: {
            first: data.name.first,
            last: data.name.last,
        },
        email: data.email,
        comments: data.comments,
        type: 'person',
        timestamp: (new Date())
    }
    var id = data.id ? data.id : uuid.v4();
    bucket.upsert(id, person, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result);
    });
}

function CommentModel() { }

CommentModel.create = function (data, callback) {
    var comment = {
        message: data.message,
        timestamp: (new Date()),
        type: "comment"
    }
    var id = uuid.v4();
    bucket.insert(id, comment, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        comment.id = id;
        callback(null, comment);
    })
}


module.exports.PersonModel = PersonModel;
module.exports.CommentModel = CommentModel;