var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "<username>",
    password: "<password>",
    database: "bamazon"
});

module.exports = {connection};