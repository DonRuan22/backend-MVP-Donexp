const mssql = require('mssql');

class DBConnection {
  async getConnection() {
     try {
       return await mssql.connect({
              user: "rdonino",
              password: "231295Don@",
              server: "donexp2.database.windows.net",
              database: 'donexp'
       });
    }
    catch(error) {
      console.log(error);
    }
  }

  async testing(){
    try{
    const conn = await this.getConnection(); 
   
    const myEmail = "john@gmail.com";
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
    return user;
    }
    catch(error) {
      console.log(error);
    } 
   }

  
}

class Test {
   async testing(){
    try{
    const mssqlcon = new DBConnection();
    const conn = await mssqlcon.getConnection(); 
   
    const myEmail = "test@gmail.com";
    const user = await conn.request().query("select * from users" ).recordset;
    return user;
    }
    catch(error) {
      console.log(error);
    } 
   }
}
const asyncTest = async () => {
  const mssqlcon = new DBConnection();
  const conn = await mssqlcon.getConnection(); 
 
  const myEmail = "test@gmail.com";
  const user = await conn.request().query("select * from users" ).recordset;
  return user;
}

connection = new DBConnection();


const connec = (async () => {
  return await connection.getConnection();
})();

 
module.exports =  {conn_obj:connection,conn:connec};