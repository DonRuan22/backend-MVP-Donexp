const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');
const mssqlcon = require('../config/db_connection');
const mssql = require('mssql');

/* GET users listing. */
router.get('/', async function (req, res) {
    /*
    database.table('users')
        .withFields([ 'username' , 'email', 'fname', 'lname', 'age', 'role', 'id' ])
        .getAll().then((list) => {
        if (list.length > 0) {
            res.json({users: list});
        } else {
            res.json({message: 'NO USER FOUND'});
        }
    }).catch(err => res.json(err));
    */
    const conn = await mssqlcon.conn;
    let list = await conn.request()
                            .query("SELECT username , email, fname, lname, role, id FROM users");
    list = list.recordset;
    try{
        if (list.length > 0) {
            res.json({users: list});
        } else {
            res.json({message: 'NO USER FOUND'});
        }
    }catch(err){res.json(err)}
});

/**
 * ROLE 777 = ADMIN
 * ROLE 555 = CUSTOMER
 */


/* GET ONE USER MATCHING ID */
router.get('/:userId', async(req, res) => {
    let userId = req.params.userId;
    /*
    database.table('users').filter({id: userId})
        .withFields([ 'username' , 'email','fname', 'lname', 'age', 'role', 'id' ])
        .get().then(user => {
        if (user) {
            res.json({user});
        } else {
            res.json({message: `NO USER FOUND WITH ID : ${userId}`});
        }
    }).catch(err => res.json(err) );
    */
    const conn = await mssqlcon.conn;
    let user = await conn.request()
                            .input("id", mssql.Int, userId)
                            .query("SELECT username , email, fname, lname, role, id FROM users WHERE id = @id");
    user = user.recordset[0];
    try{
        if (user) {
            res.json({user});
        } else {
            res.json({message: `NO USER FOUND WITH ID : ${userId}`});
        }
    }catch(err){res.json(err)}
});


/* GET ONE USER WITH EMAIL MATCH  */
router.get('/validate/:email', async(req, res) => {
	
	let email = req.params.email;
	/*
	database.table('users').filter({email: email})
			.get()
			.then(user => {
				 if (user) {
            res.json({user: user, status: true});
        } else {
            res.json({status: false, user: null});
        }
			})
            .catch(err => res.json(err));
        */
    const conn = await mssqlcon.conn;
    let user = await conn.request()
                            .input("email", mssql.VarChar, email)
                            .query("SELECT * FROM users WHERE email = @email");
    user = user.recordset[0];
    try{
        if (user) {
            res.json({user: user, status: true});
        } else {
            res.json({status: false, user: null});
        }
    }catch(err){res.json(err)}
	
});



/* UPDATE USER DATA */
router.patch('/:userId', async (req, res) => {
    let userId = req.params.userId;     // Get the User ID from the parameter

    // Search User in Database if any
    const conn = await mssqlcon.conn;
    let user = await conn.request()
                            .input("id", mssql.Int, userId)
                            .query("SELECT username , email, fname, lname, age, role, id FROM users WHERE id = @id");
    user = user.recordset[0];
    
    if (user) {

        let userEmail = req.body.email;
        let userPassword = req.body.password;
        let userFirstName = req.body.fname;
        let userLastName = req.body.lname;
        let userUsername = req.body.username;
        let age = req.body.age;

        if (userEmail == undefined){userEmail = 'undefined'}
        if (userPassword == undefined){userPassword = 'undefined'}
        if (userFirstName == undefined){userFirstName = 'undefined'}
        if (userLastName == undefined){userLastName = 'undefined'}
        if (userUsername == undefined){userUsername = 'undefined'}
        if (age == undefined){age = 0}

        /*
        // Replace the user's information with the form data ( keep the data as is if no info is modified )
        database.table('users').filter({id: userId}).update({
            email: userEmail !== undefined ? userEmail : user.email,
            password: userPassword !== undefined ? userPassword : user.password,
            username: userUsername !== undefined ? userUsername : user.username,
            fname: userFirstName !== undefined ? userFirstName : user.fname,
            lname: userLastName !== undefined ? userLastName : user.lname,
            age: age !== undefined ? age : user.age
        }).then(result => res.json('User updated successfully')).catch(err => res.json(err));
        */
        const conn = await mssqlcon.conn;
        let successId = await conn.request()
        .input('userEmail', mssql.VarChar, userEmail)
        .input('userPassword', mssql.VarChar, userPassword)
        .input('userFirstName', mssql.VarChar, userFirstName)
        .input('userLastName', mssql.VarChar, userLastName)
        .input('userUsername', mssql.VarChar, userUsername)
        .input('userId', mssql.VarChar, userId)
        .input('age', mssql.Int, age)
        .output("id", mssql.Int)
        .query("UPDATE users SET email = CASE WHEN @userEmail = 'undefined' THEN email ELSE @userEmail END, password = CASE WHEN @userPassword = 'undefined' THEN password ELSE @userPassword END, fname = CASE WHEN @userFirstName = 'undefined' THEN fname ELSE @userFirstName END, lname= CASE WHEN @userLastName = 'undefined' THEN lname ELSE @userLastName END, username = CASE WHEN @userUsername = 'undefined' THEN username ELSE @userUsername END, age = CASE WHEN @age = 0 THEN age ELSE @age END WHERE id = @userId;SELECT @id = SCOPE_IDENTITY()");
        successId = successId.output['id'];
        try{
            res.json('User updated successfully');
        }catch(err){res.json(err)}
    }
});

module.exports = router;