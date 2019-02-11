var ProductType = require('../models/productType').ProductType;

var appRouter = function (app) {

    app.get('/productType', function (req, res) {
        ProductType.getAll(function (error, result) {
            if (error) {
                return res.status(400).send(error);
            }
            res.send(result);
        });
    });

    app.get('/productType/:id', function (req, res) {
        ProductType.getById(req.params, function (error, result) {
            if (error) {
                return res.status(400).send(error);
            }
            res.send(result);
        });
    });

    app.post('/productType', function (req, res) {
        ProductType.save(req.body, function (error, result) {
            if (error) {
                return res.status(400).send(error);
            }
            res.send(result);
        });
    });

}

module.exports = appRouter;