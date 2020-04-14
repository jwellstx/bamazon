var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "utcodingcamp",
    database: "bamazon"
});

connection.connect(err => { if (err) throw err; });

connection.query("SELECT * FROM products", (err, rows) => {
    if (err) throw err;
    console.table(rows, ['product_name', 'price']);

    inquirer.prompt([
        {
            type: "input",
            message: "Which item ID would you like to purchase?",
            name: "id",
            validate: (value) => {
                if (isNaN(value) == false && rows[value]) return true;
                else return false;
            }
        },
        {
            type: "input",
            message: "How many units would you like to purchase?",
            name: "numOfUnits",
            validate: (value) => {
                if (isNaN(value) == false) return true;
                else return false;
            }
        },
    ]).then(response => {
        if (response.numOfUnits > rows[response.id].stock_quantity) {
            console.log("Insufficient quantity! We currently only have", rows[response.id].stock_quantity, rows[response.id].product_name, "in stock.");
            connection.end();
        }
        else {
            var totalCost = response.numOfUnits * rows[response.id].price;
            console.log("Processing your request of (" + response.numOfUnits + ") " + rows[response.id].product_name);

            connection.query("UPDATE products SET stock_quantity = ? WHERE product_name = ?",
                [rows[response.id].stock_quantity - response.numOfUnits, rows[response.id].product_name],
                (err, results) => {
                    if (err) throw err;
                    console.log("Process successful! Total cost of items is: $" + totalCost);
                    connection.end();
                });
        }
    })
})