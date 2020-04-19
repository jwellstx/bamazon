var inquirer = require('inquirer');
var connection = require('./mysql_credentials.js').connection;

connection.connect(err => { if (err) throw err; customer(); });

function customer() {
    // Get all items in products table
    connection.query("SELECT * FROM products", (err, rows) => {
        if (err) throw err;
        console.table(rows, ['product_name', 'price', 'stock_quantity']);

        // Ask the user which item they would like to purchase and how many.
        // check for valid item and item count
        inquirer.prompt([
            {
                type: "input",
                message: "Which item ID would you like to purchase? (Enter q to quit):",
                name: "id",
                validate: (value) => {
                    if (value.toLowerCase() === 'q') process.exit();
                    if (isNaN(value) == false && rows[value]) return true;
                    else return false;
                }
            },
            {
                type: "input",
                message: "How many units would you like to purchase? (Enter q to quit):",
                name: "numOfUnits",
                validate: (value) => {
                    if (value.toLowerCase() === 'q') process.exit();
                    if (isNaN(value) == false) return true;
                    else return false;
                }
            },
        ]).then(response => {
            // If we don't have enough quantity, report it and ask the user again what they'd like to purchase
            if (response.numOfUnits > rows[response.id].stock_quantity) {
                console.log("Insufficient quantity! We currently only have", rows[response.id].stock_quantity, rows[response.id].product_name, "in stock.");
                customer();
            }
            else {
                // If we have the quantity, notify user what they purchase, quantity and total cost
                // Also update the quantity in the DB
                var totalCost = response.numOfUnits * rows[response.id].price;
                var product_sales = rows[response.id].product_sales + totalCost;
                console.log("Processing your request of (" + response.numOfUnits + ") " + rows[response.id].product_name);

                connection.query("UPDATE products SET stock_quantity = ?, product_sales = ? WHERE product_name = ?",
                    [rows[response.id].stock_quantity - response.numOfUnits, product_sales, rows[response.id].product_name],
                    (err, results) => {
                        if (err) throw err;
                        console.log("Process successful! Total cost of items is: $" + totalCost.toFixed(2));
                        // print update results
                        printUpdatedResultsProducts();
                        connection.end();
                    });
            }
        })
    })
}


function printUpdatedResultsProducts() {
    // Helper function to just print the DB info
    connection.query("SELECT * FROM products", (err, rows) => {
        if (err) throw err;
        console.table(rows, ['product_name', 'price', 'stock_quantity']);
    });
}