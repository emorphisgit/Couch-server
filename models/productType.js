var uuid = require('uuid');
var N1qlQuery = require('couchbase').N1qlQuery;
var bucket = require('../app').bucket;

function ProductType() { }

ProductType.getAll = function (callback) {
    var statement = "SELECT META(product).id, * FROM product";
    var query = N1qlQuery.fromString(statement);
    bucket.query(query, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result);
    });
}

ProductType.getById = function (data, callback) {
    bucket.get(data.id, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result.value);
    });
}

ProductType.save = function (data, callback) {
    var productType = {
        products: data.products,
        type: data.type,
        timestamp: (new Date())
    }
    var id = data.id ? data.id : uuid.v4();
    bucket.upsert(id, productType, function (error, result) {
        if (error) {
            console.log(error);
            return callback(error, null);
        }
        callback(null, result);
    });
}

module.exports.ProductType = ProductType;