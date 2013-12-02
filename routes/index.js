
/*
 * GET home page.
 */
exports.index = function(FxRates, Product) {
  return function(req, res) {
    // Load all products
    Product.find({}, function(error, products) {
      res.render('index', { products : products, rates : FxRates.get() });
    });
  };
};