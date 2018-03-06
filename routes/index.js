var express = require("express");
var fs = require("fs");
const router = express.Router();
const validator = require('express-joi-validation')({});
const Joi = require('joi');

var Products = require("../models/product");
var productdb = fs.readFileSync('db.json', 'utf8');

var product = new Products();

const userSchema = Joi.object({
    productName: Joi.string().min(5).max(125).required(),
    price: Joi.number().integer().positive().required(),
    inTheBox: Joi.string().min(10).max(130).required(),
    modelNumber: Joi.string().required(),
    size: Joi.string().required(),
    category: Joi.string().required(),
    color: Joi.string().required(),
    touchScreen: Joi.string().required(),
    image: Joi.string().required()
});

// 1. List All Product
router.post("/", function (req, res, next) {
    var params = req.body;
    var prod = product.listProducts(params);
    res.send(prod);
    res.end();
});

// 2. Add New Product
router.post("/add", function (req, res, next) {
    const ret = Joi.validate(req.body, userSchema, {
        allowUnknown: false,
        abortEarly: false
    });
    if (ret.error) {
        res.status(400).send(ret.error.details);
    } else {
        let prod = product.add(req.body);
        res.send(prod);
    }
});

// 3. Update Existing Product
router.put("/update", function (req, res, next) {
    const ret = Joi.validate(req.body, userSchema, {
        allowUnknown: true,
        abortEarly: false
    });
    let productId = req.body.id;
    if (ret.error) {
        res.status(400).send(ret.error.details);
    } else {
        let index = JSON.parse(productdb).findIndex(prod => prod.id == productId);
        if (index > -1) {
            let prod = product.update(req.body);
            res.send(prod);
        } else {
            res.status(401).send("Product ID InCorrect");
        }

    }
});

// 4. Delete Existing Product
router.delete("/delete", function (req, res, next) {
    let productId = req.body.id;
    if (!productId) {
        res.status(401).send("Need Product ID to delete");
    } else {
        let index = JSON.parse(productdb).findIndex(prod => prod.id == productId);
        if (index > -1) {
            let prod = product.delete(index);
            res.send(prod);
        } else {
            res.status(401).send("Product ID InCorrect");
        }
    }
});

// 5. Search By Exact Name or Id
router.post("/product/searchByNameorId", function (req, res, next) {
    var params = req.body;
    let error = "";
    if (params.id == undefined && params.productName == undefined) {
        error = { msg: "Provide Id or Product Name" };
    } else if (params.id != undefined && params.productName != undefined) {
        error = { msg: " Provide Either Id or Product Name" };
    }
    if (error) {
        res.status(400).send(error);
    } else {
        params.hasOwnProperty('productName') ? params.search = 'productName' : params.search = 'id';
        var prod = product.searchByNameorId(params);
        if (prod != null) {
            res.json(prod);
        } else {
            res.status(400);
            res.send("Product not found");
        }
    }
});

// 6. Search By Name with Pagination
router.post("/product/searchByName", function (req, res, next) {
    var params = req.body;
    if (params.name != undefined) {
        let prod = product.searchByName(params);
        res.send(prod);
    } else {
        res.status(400).send("Product Name required");
    }

});

// 7. List Product by Category
router.post("/product/category", function (req, res, next) {
    let prod = product.category();
    res.json(prod);
});

// 8. Global Search 
router.post("/product/search", function (req, res, next) {
    if (!req.body.searchValue) {
        res.status(400).send("Search Value can't Empty");
    } else {
        let prod = product.search(req.body);
        if (prod == null) {
            res.status(200).send("Search Not Found");
        } else {
            res.json(prod);
        }
    }
});

module.exports = router;