var ProductDetail = require('../models/productDetail').ProductDetail;
var ProductType = require('../models/productType').ProductType;

var appRouter = function (app) {
    app.get('/productDetail', function (req, res) {
        ProductDetail.getAll(function (error, result) {
            if (error) {
                console.log(error);
                return res.status(400).send(error);
            }
            res.send(result);
        });
    });

    app.get('/productDetail/:id', function (req, res) {
        ProductDetail.getById(req.params, function (error, result) {
            if (error) {
                return res.status(400).send(error);
            }
            res.send(result);
        });
    });

    app.post('/productDetail', function (req, res) {
        ProductDetail.create(req.body, function (error, detail) {
            if (error) {
                return res.status(400).send(error);
            }
            ProductType.getById(req.body, function (error, type) {
                if (error) {
                    return res.status(400).send(error);
                }
                if (!type.products) {
                    type.products = [];
                }
                type.products.push(detail.id);
                type.id = req.body.id;
                ProductType.save(type, function (error, results) {
                    if (error) {
                        return res.status(400).send(error);
                    }
                    res.send(type);
                });
            });
        });
    });
}

module.exports = appRouter;