var fs = require("fs");
var ignoreCase = require('ignore-case');
var filter = require('filter-values');

var Products = fs.readFileSync('db.json', 'utf8');
var wholeProducts = JSON.parse(Products);


module.exports = function products() {
    this.listProducts = function (params) {
        return JSON.parse(Products).splice(params.offset, params.limit);
    };

    this.add = function (params) {
        let productId = Number(wholeProducts[wholeProducts.length - 1].id) + 1;
        let product = Object.assign({ id: productId }, params);
        wholeProducts.push(product)
        fs.writeFileSync('db.json', JSON.stringify(wholeProducts));
        return wholeProducts;
    };

    this.update = function (params) {
        let index = wholeProducts.findIndex(
            prod => prod.id == params.id
        );
        wholeProducts[index] = params;
        fs.writeFileSync('db.json', JSON.stringify(wholeProducts));
        return wholeProducts;
    };

    this.delete = function (index) {
        wholeProducts.splice(index, 1);
        fs.writeFileSync('db.json', JSON.stringify(wholeProducts));
        return wholeProducts;
    };

    this.searchByName = function (params) {
        let product = wholeProducts.filter(prod =>
            ignoreCase.includes(prod.productName, params.name)
        );
        return product.splice(params.offset, params.limit);
    }

    this.searchByNameorId = function (params) {
        let product = wholeProducts.filter(p => p[params.search] == params[params.search]);
        if (product.length > 0) {
            return product;
        } else {
            return null;
        }
    }

    this.category = function () {
        var categoryProducts = {};
        for (const [index] of wholeProducts.entries()) {
            var category = wholeProducts[index]["category"];
            if (categoryProducts[category]) {
                categoryProducts[category].push(wholeProducts[index]);
            } else {
                categoryProducts[category] = new Array(wholeProducts[index]);
            }
        }
        return categoryProducts;
    }

    this.search = function (params) {
        var searchProducts = [];
        for (const prod of wholeProducts) {
            filter(prod, function (value, key, obj) {
                if (ignoreCase.includes(value, params.searchValue)) {
                    let index = searchProducts.findIndex(item => item.id == prod.id);
                    if (index == -1) {
                        searchProducts.push(obj);
                    }

                }
            });
        }
        if (searchProducts.length == 0) {
            return null
        } else {
            return searchProducts
        }
    }
}