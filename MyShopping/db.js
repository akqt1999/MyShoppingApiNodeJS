const sql = require('mssql')
var config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'MyShopping',

   

    stream: false,
    options: {
        trustedConnection: true,
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,

    },

};



const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connect to MSSQL')
        return pool
    }).catch(err => console.log('Database connection failed : ', err));

module.exports = { sql, poolPromise } // cai nay la se truyen qua file index .js 