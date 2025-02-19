const express = require('express');
const {check, validationResult, body} = require('express-validator');
const router = express.Router();
const helper = require('../config/helpers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {database} = require('../config/helpers');
const mssqlcon = require('../config/db_connection');
const mssql = require('mssql');

// LOGIN ROUTE
router.post('/login', [helper.hasAuthFields, helper.isPasswordAndUserMatch], async (req, res) => {
    let token = jwt.sign({state: 'true', email: req.body.email, username: req.body.username}, helper.secret, {
        algorithm: 'HS512',
        expiresIn: '4h'
    });
    
    /*
	database.table('users').filter({email: req.email})
            .get()
    */
    const conn = await mssqlcon.conn;
    let user = await conn.request()
                          .input('email', mssql.VarChar, req.email)
                          .query("select * from dbo.users where email = @email");
    user = user.recordset;
    //console.log(user);
    if(user.length > 0){
        user = user[0];
        res.json({
            token: token,
            auth: true,
            user: user
        });
    }
    else{
        user= null;
        res.json({user: null});
        console.log("error")
    }
});			

// REGISTER ROUTE
router.post('/register', [
    check('email').isEmail().not().isEmpty().withMessage('Field can\'t be empty')
        .normalizeEmail({all_lowercase: true}),

    check('password').escape().trim().not().isEmpty().withMessage('Field can\'t be empty')
        .isLength({min: 6}).withMessage("must be 6 characters long"),
    body('email').custom(async (value) => {
        /*
        return helper.database.table('users').filter({
            $or:
                [
                    {email: value}, {username: value.split("@")[0]}
                ]
        }).get().then(user => {
            if (user) {
                console.log(user);
                return Promise.reject('Email / Username already exists, choose another one.');
            }
        })
        */
       const conn = await mssqlcon.conn;
       let user = await conn.request()
                          .input('email', mssql.VarChar, value)
                          .input('username', mssql.VarChar, value.split("@")[0])
                          .query("select * from dbo.users where email = @email OR username = @username");
        user = user.recordset;
        if (user.length > 0) {
            console.log(user);
            return Promise.reject('Email / Username already exists, choose another one.');
        }
        return user;
    })
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    } else {
        let email = req.body.email;
        let username = email.split("@")[0];
        let password = await bcrypt.hash(req.body.password, 10);
        let fname = req.body.fname;
        let lname = req.body.lname;
        let typeOfUser = req.body.typeOfUser === undefined ? 'local' : req.body.typeOfUser;
        let photoUrl = req.body.photoUrl === null ? 'https://image.shutterstock.com/image-vector/person-gray-photo-placeholder-man-260nw-1259815156.jpg' : req.body.photoUrl;

        /**
         * ROLE 777 = ADMIN
         * ROLE 555 = CUSTOMER
         **/
        /*
        helper.database.table('users').insert({
            username: username,
            password: password || null,
            email: email,
            role: 555,
            lname: lname || null,
            fname: fname || null,
            type: typeOfUser || 'local',
            photoUrl: photoUrl
        }).then(lastId => {
            if (lastId > 0) {
                res.status(201).json({message: 'Registration successful'});
            } else {
                res.status(501).json({message: 'Registration failed'});
            }
        }).catch(err => res.status(433).json({error: err}));
        */
        const conn = await mssqlcon.conn;
        console.log(req.body);
        let user = await conn.request()
                                .input('email', mssql.VarChar, email)
                                .input('username', mssql.VarChar, username)
                                .input('password', mssql.VarChar, password)
                                .input('fname', mssql.VarChar, fname)
                                .input('lname', mssql.VarChar, lname)
                                .input('typeOfUser', mssql.VarChar, typeOfUser)
                                .input('photoUrl', mssql.VarChar, photoUrl)
                                .output("id", mssql.Int)
                                .query("INSERT INTO users (email, username, password, fname, lname, type, photoUrl,role) VALUES (@email, @username, @password, @fname, @lname, @typeOfUser, @photoUrl, 555);SELECT @id = SCOPE_IDENTITY()");
        var userId = user.output['id'];
        try{
            if (userId > 0) {
                res.status(201).json({message: 'Registration successful'});
            } else {
                res.status(501).json({message: 'Registration failed'});
            }
        }
        catch(err){ res.status(433).json({error: err})};
    }
});


module.exports = router;