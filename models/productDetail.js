var uuid = require('uuid');
var N1qlQuery = require('couchbase').N1qlQuery;
var bucket = require('../app').bucket;

function ProductDetail() { }

ProductDetail.getAll = function (callback) {
    var statement = "SELECT META(product).id, * FROM product";
    var query = N1qlQuery.fromString(statement);
    bucket.query(query, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result);
    });
}

ProductDetail.getById = function (data, callback) {
    bucket.get(data.id, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result.value);
    });
}

ProductDetail.create = function (data, callback) {
    var product = {
        code: data.code,
        name: data.name,
        manufacturer: data.manufacturer,
        quantity: data.quantity,
        price: data.price,
        type: data.type,
        timestamp: new Date()
    }
    var id = uuid.v4();
    bucket.insert(id, product, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        product.id = id;
        callback(null, product);
    })
}

module.exports.ProductDetail = ProductDetail;