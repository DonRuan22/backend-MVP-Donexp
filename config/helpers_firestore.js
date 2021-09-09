const { Connection, Request } = require("tedious");
const mssqlcon = require('./db_connection');
const mssql = require('mssql');

(async () => {
  const conn = await mssqlcon.conn;

  const user = await conn.request()
                          .input('email', mssql.VarChar, "ok")
                          .input('username', mssql.VarChar, "teste")
                          .input('password', mssql.VarChar, "teste")
                          .input('fname', mssql.VarChar, "teste")
                          .input('lname', mssql.VarChar, "teste")
                          .input('typeOfUser', mssql.Int, 555)
                          .input('photoUrl', mssql.VarChar, "teste")
                          .output("id", mssql.Int)
                          .query("INSERT INTO users (email, username, password, fname, lname, type, photoUrl,role) VALUES (@email, @username, @password, @fname, @lname, @typeOfUser, @photoUrl, 555);SELECT @id = SCOPE_IDENTITY()");
  console.log(user);
})();



/*
// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "rdonino", // update me
      password: "231295Don*" // update me
    },
    type: "default"
  },
  server: "shopdex.database.windows.net", // update me
  options: {
    database: "shopdex", //update me
    encrypt: true
  }
};


const connection = new Connection(config);
connection.connect();


// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    queryDatabase();
  }
});

function queryDatabase() {
  console.log("Reading rows from the Table...");

  // Read all rows from table
  const request = new Request(
    `SELECT *
     FROM dbo.users`,
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) returned`);
      }
    }
  );

  request.on("row", columns => {
    columns.forEach(column => {
      console.log("%s\t%s", column.metadata.colName, column.value);
    });
  });

  connection.execSql(request);
}
*/
