const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');
const crypto = require('crypto');
const mssqlcon = require('../config/db_connection');
const mssql = require('mssql');


// GET ALL ORDERS
router.get('/', async (req, res) => {
    /*
    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username','od.quantity','u.fname','u.lname','u.email'])
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.json(orders);
            } else {
                res.json({message: "No orders found"});
            }

        }).catch(err => res.json(err));
        */
    const conn = await mssqlcon.conn;
    let orders = await conn.request()
                          .query("SELECT orders.id, products.title, products.description, products.price, users.username, orders_details.quantity, users.fname, users.lname, users.email FROM orders, products, users, orders_details WHERE orders.id = orders_details.order_id AND products.id = orders_details.product_id AND users.id = orders.user_id");
    orders = orders.recordset;
    try{
        if (orders.length > 0) {
            res.json(orders);
        } else {
            res.json({message: "No orders found"});
        }
    }catch(err){res.json(err)}
});

// GET ALL ORDERS
router.get('/shop/:id', async (req, res) => {
    let userId = req.params.id;
    /*
    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            },
            {
                table: 'addresses as ad',
                on: 'u.id = o.user_id'
            },
            {
                table: 'shops as s',
                on: 's.id = od.shop_id'
            },
            {
                table: 'register as reg',
                on: 'reg.shop_id = od.shop_id'
            }
        ])
        .withFields(['o.id', 'o.status','p.title', 'p.description', 'p.price', 'u.username','ad.line2','ad.state','ad.country','ad.phone','od.quantity','u.fname','u.lname','u.email'])
        .filter({'reg.user_id': userId})
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.json(orders);
            } else {
                res.json({message: "No orders found"});
            }

        }).catch(err => res.json(err));
    */
    const conn = await mssqlcon.conn;
    let orders = await conn.request()
                            .input('user_Id', mssql.Int, userId)
                            .query("SELECT orders.id, orders.status, products.title, products.description, products.price, users.username, addresses.line2, addresses.state, addresses.country, addresses.phone, orders_details.quantity, users.fname, users.lname, users.email FROM orders, products, users, orders_details, addresses, shops, register WHERE users.id = @user_Id AND orders.id = orders_details.order_id AND products.id = orders_details.product_id AND users.id = orders.user_id AND users.addresses= addresses.id AND shops.id = orders_details.shop_id AND register.shop_id = orders_details.shop_id");
    orders = orders.recordset;
    try{
        if (orders.length > 0) {
            res.json(orders);
        } else {
            res.json({message: "No orders found"});
        }
    }catch(err){res.json(err)}
});

// Get Single Order
router.get('/:id', async (req, res) => {
    let orderId = req.params.id;
    console.log(orderId);
    /*
    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered'])
        .filter({'o.id': orderId})
        .getAll()
        .then(orders => {
           
            if (orders.length > 0) {
                res.json(orders);
            } else {
                res.json({message: "No orders found"});
            }

        }).catch(err => res.json(err));
    */
    const conn = await mssqlcon.conn;
    let orders = await conn.request()
                        .input('order_Id', mssql.Int, orderId)
                        .query("SELECT orders.id, products.title, products.description, products.price, users.username, orders_details.quantity, users.fname, users.lname, users.email FROM orders, products, users, orders_details WHERE orders.id = @order_Id AND orders.id = orders_details.order_id AND products.id = orders_details.product_id AND users.id = orders.user_id");
    orders = orders.recordset;
    try{
        if (orders.length > 0) {
            res.json(orders);
        } else {
            res.json({message: "No orders found"});
        }
    }catch(err){res.json(err)}
});

// Place New Order
router.post('/new', async (req, res) => {
    // let userId = req.body.userId;
    // let data = JSON.parse(req.body);
    let {userId, shopId, products} = req.body;

    if (userId !== null && userId > 0) {
        /* 
        database.table('orders')
            .insert({
                user_id: userId
            }).then((newOrderId) => {

            if (newOrderId > 0) {
                products.forEach(async (p) => {

                        let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();



                    let inCart = parseInt(p.incart);

                    // Deduct the number of pieces ordered from the quantity in database

                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;

                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }

                    } else {
                        data.quantity = 0;
                    }
        */
        const conn = await mssqlcon.conn;
        let orders = await conn.request()
                                    .input('user_id', mssql.Int, userId)
                                    .output("id", mssql.Int)
                                    .query("INSERT INTO orders (user_id, status) VALUES (@user_id, 1);SELECT @id = SCOPE_IDENTITY()");
        var newOrderId = orders.output['id'];
        try{
            if (newOrderId) {
                products.forEach(async (p) => {

                        //let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();
                    let data = await conn.request()
                                            .input('p_id', mssql.Int, p.id)
                                            .query("SELECT quantity FROM products WHERE id = @p_id");
                    data = data.recordset[0];


                    let inCart = parseInt(p.incart);

                    // Deduct the number of pieces ordered from the quantity in database

                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;

                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }

                    } else {
                        data.quantity = 0;
                    }

                    let orders_details = await conn.request()
                                    .input('newOrderId', mssql.Int, newOrderId)
                                    .input('product_id', mssql.Int, p.id)
                                    .input('quantity', mssql.Int, inCart)
                                    .input('shopId', mssql.Int, shopId)
                                    .output("id", mssql.Int)
                                    .query("INSERT INTO orders_details (order_id, product_id, quantity, shop_id) VALUES (@newOrderId, @product_id, @quantity, @shopId);SELECT @id = SCOPE_IDENTITY()");
                    var newId = orders_details.output['id'];
                    
                    let successNum = await conn.request()
                                    .input('product_id', mssql.Int, p.id)
                                    .input('quantity', mssql.Int, data.quantity)
                                    .output("id", mssql.Int)
                                    .query("UPDATE products SET quantity = @quantity WHERE id = @product_id;SELECT @id = SCOPE_IDENTITY()");
                });
            } else {
                res.json({message: 'New order failed while adding order details', success: false});
            }
            res.json({
                message: `Order successfully placed with order id ${newOrderId}`,
                success: true,
                order_id: newOrderId,
                products: products
            });

        }catch(err){res.json(err)}
                    // Insert order details w.r.t the newly created order Id
                    /*
                    database.table('orders_details')
                        .insert({
                            order_id: newOrderId,
                            product_id: p.id,
                            quantity: inCart
                        }).then(newId => {
                        database.table('products')
                            .filter({id: p.id})
                            .update({
                                quantity: data.quantity
                            }).then(successNum => {
                        }).catch(err => console.log(err));
                    }).catch(err => console.log(err));
                });

            } else {
                res.json({message: 'New order failed while adding order details', success: false});
            }
            res.json({
                message: `Order successfully placed with order id ${newOrderId}`,
                success: true,
                order_id: newOrderId,
                products: products
            })
        }).catch(err => res.json(err));
        */
    }

    else {
        res.json({message: 'New order failed', success: false});
    }

});

// Payment Gateway
router.post('/payment', (req, res) => {
    setTimeout(() => {
        res.status(200).json({success: true});
    }, 3000)
});

module.exports = router;