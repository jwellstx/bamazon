var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "utcodingcamp",
    database: "bamazon"
});

connection.connect(err => { if (err) throw err; manager(); });

function manager() {
    // Ask the manager which operation they would like to do then call corresponding function
    inquirer.prompt([
        {
            type: "list",
            message: "Which option would you like to execute?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
            name: "choice"
        },
    ]).then(answer => {
        switch (answer.choice) {
            case "View Products for Sale":
                viewProductsForSale();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            default:
                console.log("No Valid options selected!"); // shouldnt be hit
        }
    });
}

function viewProductsForSale() {
    // Simply pull products from DB and display them.
    connection.query("SELECT * FROM products", (err, rows) => {
        if (err) throw err;
        console.log("Viewing current products for sale...");
        console.table(rows);
        connection.end();
    });
}

function viewLowInventory() {
    // If any inventory is lower than 6, notify the manager to restock
    connection.query("SELECT * FROM products WHERE stock_quantity < 6", (err, rows) => {
        console.log("Checking for low inventory items...");
        console.table(rows);
        connection.end();
    });
}

function addToInventory() {
    // Let the manager select which item they would like to restock.  Ask for quantity to add as well.
    // validate the inputs
    connection.query("SELECT product_name, stock_quantity FROM products", (err, rows) => {
        if (err) throw err;
        console.log("Attempting to increase quantity of item in products...");
        inquirer.prompt([
            {
                type: "list",
                message: "Which item would you like to increase the quantity of?",
                name: "item",
                choices: rows.map(a => a.product_name), // same as map(function(a) {return a.product_name}) where 'a' is each element
            }
        ]).then(answer => {
            var currentQuantity = 0;
            // For loops to find the current stock quantity of the item selected
            for (var x = 0; x < rows.length; x++) {
                if (rows[x].product_name === answer.item) {
                    currentQuantity = rows[x].stock_quantity;
                }
            }
            // Ask the manager how many units they'd like to add to the inventory
            inquirer.prompt([
                {
                    type: "input",
                    message: "How many items would you like to add to the inventory? (Current inventory is: " + currentQuantity + ") (Enter q to quit):",
                    name: "newInventory",
                    validate: (value) => {
                        if (value.toLowerCase() === 'q') process.exit();
                        if (isNaN(value) == false && value > 0) return true;
                        else return false;
                    }
                }
            ]).then(answer2 => {
                // Update the selected items quantity with the current quantity plus the new inventory to be added in the DB
                var newInventoryCount = parseInt(answer2.newInventory) + parseInt(currentQuantity);
                connection.query("UPDATE products SET stock_quantity = ? WHERE product_name = ?", [newInventoryCount, answer.item], err => {
                    if (err) throw err;
                    console.log("Successfully updated the quantity of", answer.item, "from", currentQuantity, "to", newInventoryCount);
                    printUpdatedResultsProducts();
                    connection.end();
                });  // end of updating stock quantity
            }); // end of inquirer
        });  // end of getting all products with quantity less than 6
    });
}

function addNewProduct() {
    // Ask Manager item name, department, quantity and price
    console.log("Attempting to add a new product to the database...");
    connection.query("SELECT department_name FROM departments", (err, rows) => {
        // Used to display available departments so Manager doenst have to manually enter (only supervisor can add new dept)
        var deparments = rows.map(a => a.department_name);
        inquirer.prompt([
            {
                type: "input",
                message: "What is the product name? (Enter q to quit):",
                name: "productName",
                validate: (value) => {
                    if (value.toLowerCase() === 'q') process.exit();
                    return true;
                }
            },
            {
                type: "list",
                message: "What department is this item located in? (Enter q to quit):",
                choices: deparments,
                name: "department",
                validate: (value) => {
                    if (value.toLowerCase() === 'q') process.exit();
                    return true;
                }
            },
            {
                type: "input",
                message: "What is the price of this item? (Enter q to quit):",
                name: "price",
                validate: (value => {
                    if (value.toLowerCase() === 'q') process.exit();
                    if (isNaN(value) == false && value > 0) return true;
                    else return false;
                })
            },
            {
                type: "input",
                message: "How much stock do you currently have? (Enter q to quit):",
                name: "stock",
                validate: (value => {
                    if (value.toLowerCase() === 'q') process.exit();
                    if (isNaN(value) == false && value > 0) return true;
                    else return false;
                })
            },
        ]).then(answer => {
            // Insert the new item into products DB
            connection.query("INSERT INTO products SET ?",
                {
                    product_name: answer.productName,
                    department_name: answer.department,
                    price: answer.price,
                    stock_quantity: answer.stock
                }, err => {
                    if (err) throw err;
                    console.log("Successfully added product:", answer.productName + ", department:", answer.department + ", price: $" + answer.price + ", quantity:", answer.stock);
                    printUpdatedResultsProducts();
                    connection.end();
                });
        });
    });
}

function printUpdatedResultsProducts() {
    // Helper function to simply display DB info
    connection.query("SELECT * FROM products", (err, rows) => {
        if (err) throw err;
        console.table(rows, ['product_name', 'price', 'stock_quantity']);
    });
}