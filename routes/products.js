const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');
const mssqlcon = require('../config/db_connection');
const mssql = require('mssql');

/* GET ALL PRODUCTS */
router.get('/', async function (req, res) {       // Sending Page Query Parameter is mandatory http://localhost:3636/api/products?page=1
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;   // set limit of items per page
    let startValue;
    let endValue;
    if (page > 0) {
        startValue = (page * limit) - limit;     // 0, 10, 20, 30
        endValue = page * limit;                  // 10, 20, 30, 40
    } else {
        startValue = 0;
        endValue = 10;
    }
    /*
    database.table('products as p')
        .join([
            {
                table: "categories as c",
                on: `c.id = p.cat_id`
            }
        ])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.id'
        ])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: "No products found"});
            }
        })
        .catch(err => console.log(err));
    */
   const conn = await mssqlcon.conn;
   let products = await conn.request()
                         .query("SELECT products.title, products.price, products.quantity, products.description, products.image, products.id, products.short_desc, products.cat, products.brand, products.sizes, products.color FROM products");
   products = products.recordset.slice(startValue, endValue)
   let prods = products.sort(function(a, b) {return a.id - b.id});
   try{
    if (prods.length > 0) {
        res.status(200).json({
            count: prods.length,
            products: prods
        });
    } else {
        res.json({message: "No products found"});
    }
   }catch(err){res.json(err)}
});

/* GET ALL PRODUCTS FROM ONE SHOP*/
router.get('/shop/:userId', async function (req, res) {       // Sending Page Query Parameter is mandatory http://localhost:3636/api/products?page=1
    let userId = req.params.userId;
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;   // set limit of items per page
    let startValue;
    let endValue;
    if (page > 0) {
        startValue = (page * limit) - limit;     // 0, 10, 20, 30
        endValue = page * limit;                  // 10, 20, 30, 40
    } else {
        startValue = 0;
        endValue = 10;
    }
    /*
    database.table('products as p')
        .join([
            {
                table: "categories as c",
                on: `c.id = p.cat_id`
            },
            {
                table: "register as reg",
                on: `p.shop = reg.shop_id`
            }
        ])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.id'
        ])
        .filter({'reg.user_id': userId})
        //.slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: "No products found"});
            }
        })
        .catch(err => console.log(err));
    */
   const conn = await mssqlcon.conn;
   let products = await conn.request()
                         .input('userId', mssql.Int, userId)
                         .query("SELECT products.title, products.price, products.quantity, products.description, products.image, products.id, products.short_desc, products.cat, products.brand, products.sizes, products.color FROM products, shop WHERE products.shop = shop.id AND shop.userId = @userId");
   products = products.recordset.slice(startValue, endValue)
   let prods = products.sort(function(a, b) {return a.id - b.id});
   try{
    if (prods.length > 0) {
        res.status(200).json({
            count: prods.length,
            products: prods
        });
    } else {
        res.json({message: "No products found"});
    }
   }catch(err){res.json(err)}
});

/* GET ONE PRODUCT*/
router.get('/:prodId', async (req, res) => {
    let productId = req.params.prodId;
    /*
    database.table('products as p')
        .join([
            {
                table: "categories as c",
                on: `c.id = p.cat_id`
            }
        ])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.id',
            'p.images'
        ])
        .filter({'p.id': productId})
        .get()
        .then(prod => {
            console.log(prod);
            if (prod) {
                res.status(200).json(prod);
            } else {
                res.json({message: `No product found with id ${productId}`});
            }
        }).catch(err => res.json(err));
    */
    const conn = await mssqlcon.conn;
    let products = await conn.request()
                            .input('productId', mssql.Int, productId)
                            .query("SELECT products.title, products.price, products.quantity, products.description, products.image, products.id, products.images, products.cat, products.brand, products.sizes, products.color FROM products WHERE products.id = @productId");
    prod = products.recordset[0];
    try{
        console.log(prod);
        if (prod) {
            res.status(200).json(prod);
        } else {
            res.json({message: `No product found with id ${productId}`});
        }
    }catch(err){res.json(err)}
});

/* GET ONE PRODUCT*/
router.get('/model', async (req, res) => {
    let productModel = req.query.prodModel;
    /*
    database.table('products as p')
        .join([
            {
                table: "categories as c",
                on: `c.id = p.cat_id`
            }
        ])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.id',
            'p.images'
        ])
        .filter({'p.id': productId})
        .get()
        .then(prod => {
            console.log(prod);
            if (prod) {
                res.status(200).json(prod);
            } else {
                res.json({message: `No product found with id ${productId}`});
            }
        }).catch(err => res.json(err));
    */
    const conn = await mssqlcon.conn;
    let products = await conn.request()
                            .input('productModel', mssql.Int, productModel)
                            .query("SELECT products.title, products.price, products.quantity, products.description, products.image, products.id, products.short_desc, products.cat, products.brand, products.sizes, products.color WHERE products.title = @productModel");
    prod = products.recordset[0];
    try{
        console.log(prod);
        if (prod) {
            res.status(200).json(prod);
        } else {
            res.json({message: `No product found model ${productModel}`});
        }
    }catch(err){res.json(err)}
});


router.delete("/delete/:prodId", async(req, res) => {
    let prodId = req.params.prodId;
  
    if (!isNaN(prodId)) {
      /*
      database
        .table("products")
        .filter({ id: prodId })
        .remove()
          .then(successNum => {
              if (successNum == 1) {
                  res.status(200).json({
                      message: `Record deleted with product id ${prodId}`,
                      status: 'success'
                  });
              } else {
                  res.status(500).json({status: 'failure', message: 'Cannot delete the product'});
            }
        })
        .catch((err) => res.status(500).json(err));
        */
        const conn = await mssqlcon.conn;
        let products = await conn.request()
                                .input('prodId', mssql.Int, prodId)
                                .query("DELETE FROM products WHERE products.id = @prodId");
        products = products.rowsAffected;
        try{
            if (products.length >0) {
                res.status(200).json({
                    message: `Record deleted with product id ${prodId}`,
                    status: 'success'
                });
            }else {
                res.status(500).json({status: 'failure', message: 'Cannot delete the product'});
            }
        }catch(err){ res.status(500).json(err)}
    } else {
      res
        .status(500)
        .json({ message: "ID is not a valid number", status: "failure" });
    }
  });


  /* UPDATE product DATA */
router.patch("/update/:prodId", async (req, res) => {
    let productId = req.params.prodId;     // Get the product ID from the parameter

  // Search product in Database if any
    //let product = await database.table('products').filter({id: productId}).get();
    // Search User in Database if any
    const conn = await mssqlcon.conn;
    let product = await conn.request()
                            .input("id", mssql.Int, productId)
                            .query("SELECT id FROM products WHERE id = @id");
    product = product.recordset[0];
    
    if (product) {
        let productTitle = req.body.title;
        let productImage = req.body.image;
        let productDescription = req.body.description;
        let productPrice = req.body.price;
        let productQuantity = req.body.quantity;
        let productShortDescription = req.body.short_description;
        let productCat = req.body.cat;

        if (productTitle == undefined){productTitle = 'undefined'}
        if (productImage == undefined){productImage = 'undefined'}
        if (productDescription == undefined){productDescription = 'undefined'}
        if (productPrice == undefined){productPrice = 'undefined'}
        if (productQuantity == undefined){productQuantity = 'undefined'}
        if (productShortDescription == undefined){productShortDescription = 'undefined'}
        if (productCat == undefined){productCat = 0}

        

        // Replace the product's information with the form data ( keep the data as is if no info is modified )
        /*
        database.table('products').filter({id: productId}).update({
            title: productTitle !== undefined ? productTitle : product.title,
            image: productImage !== undefined ? productImage : product.image,
            description: productDescription !== undefined ? productDescription : product.description,
            price: productPrice !== undefined ? productPrice : product.price,
            quantity: productQuantity !== undefined ? productQuantity : product.quantity,
            short_desc: productShortDescription !== undefined ? productShortDescription : product.short_description,
            cat_id: productCat !== undefined ? productCat : product.cat_id,
        }).then(result => res.json('product updated successfully')).catch(err => res.json(err));
        */
        const conn = await mssqlcon.conn;
        let successId = await conn.request()
        .input('product_id', mssql.Int, productId)
        .input('productTitle', mssql.VarChar, productTitle)
        .input('productImage', mssql.VarChar, productImage)
        .input('productDescription', mssql.VarChar, productDescription)
        .input('productPrice', mssql.VarChar, productPrice)
        .input('productQuantity', mssql.VarChar, productQuantity)
        .input('productShortDescription', mssql.VarChar, productShortDescription)
        .input('productCat', mssql.Int, productCat)
        .output("id", mssql.Int)
        .query("UPDATE products SET title = CASE WHEN @productTitle = 'undefined' THEN title ELSE @productTitle END, image = CASE WHEN @productImage = 'undefined' THEN image ELSE @productImage END, description = CASE WHEN @productDescription = 'undefined' THEN description ELSE @productDescription END, price= CASE WHEN @productPrice = 'undefined' THEN price ELSE @productPrice END, quantity = CASE WHEN @productQuantity = 'undefined' THEN quantity ELSE @productQuantity END, short_desc = CASE WHEN @productShortDescription = 'undefined' THEN short_desc ELSE @productShortDescription END, cat = CASE WHEN @productCat = 0 THEN cat ELSE @productCat END WHERE id = @product_id;SELECT @id = SCOPE_IDENTITY()");
        successId = successId.output['id'];
        console.log(successId);
        try{
            
            res.json('Product updated successfully');
        
        }catch(err){res.json(err)}    
    }
});

// Place New Product
router.post('/add', async (req, res) => {
    let productTitle = req.body.title;
    let productImage = req.body.image;
    let productDescription = req.body.description;
    let productPrice = req.body.price;
    let productQuantity = req.body.quantity;
    let productShortDescription = req.body.short_description;
    let productCat = req.body.cat_id;
    let userId = req.body.userId;
    let productBrand = req.body.brand;
    let productSizes = req.body.sizes;
    let productColor = req.body.color;

    /*
    let register = await database.table('register').filter({user_id: userId}).get();
    
    database.table('products')
        .insert(
            {
                title:productTitle,
                image:productImage,
                description:productDescription,
                price:productPrice,
                quantity:productQuantity,
                short_desc:productShortDescription,
                cat_id:productCat,
                shop:register.shop_id
            }
        ).then(result => res.json('product updated successfully')).catch(err => res.json(err));
        */
    const conn = await mssqlcon.conn;
    let register = await conn.request()
                            .input('userId', mssql.Int, userId)
                            .query("SELECT * FROM shop WHERE userId = @userId");
    register = register.recordset[0];

    let product = await conn.request()
                                    .input('productTitle', mssql.VarChar, productTitle)
                                    .input('productImage', mssql.VarChar, productImage)
                                    .input('productDescription', mssql.VarChar, productDescription)
                                    .input('productPrice', mssql.VarChar, productPrice)
                                    .input('productQuantity', mssql.VarChar, productQuantity)
                                    .input('productShortDescription', mssql.VarChar, productShortDescription)
                                    .input('productCat', mssql.VarChar, productCat)
                                    .input('productBrand', mssql.VarChar, productBrand)
                                    .input('productSizes', mssql.VarChar, productSizes)
                                    .input('productColors', mssql.VarChar, productColor)
                                    .input('shop_id', mssql.Int, register['id'])
                                    .output("id", mssql.Int)
                                    .query("INSERT INTO products (title, image, description, price, quantity, short_desc, cat, shop, brand, sizes, color) VALUES (@productTitle, @productImage, @productDescription, @productPrice, @productQuantity, @productShortDescription, @productCat, @shop_id, @productBrand, @productSizes, @productColors);SELECT @id = SCOPE_IDENTITY()");
    //var productId = product.output['id'];

    try{
        res.json('product updated successfully');
    }catch(err){res.json(err)}
});

        

module.exports = router;
