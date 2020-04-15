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

function viewProductsForSale() {
    connection.query("SELECT * FROM products", (err, rows) => {
        if (err) throw err;
        console.log("Viewing current products for sale...");
        console.table(rows);
        connection.end();
    });
}

function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 6", (err, rows) => {
        console.log("Checking for low inventory items...");
        console.table(rows);
        connection.end();
    });
}

function addToInventory() {
    connection.query("SELECT product_name, stock_quantity FROM products", (err, rows) => {
        if (err) throw err;
        console.log("Attempting to increase quantity of item in products...");
        inquirer.prompt([
            {
                type: "list",
                message: "Which item would you like to increase the quantity of?",
                name: "item",
                choices: rows.map(a => a.product_name) // same as map(function(a) {return a.product_name}) where 'a' is each element
            },
            {
                type: "input",
                message: "How many items would you like to add to the inventory?",
                name: "newInventory",
            }
        ]).then(answer => {
            var currentCount = 0;
            for (var x = 0; x < rows.length; x++) {
                if (rows[x].product_name === answer.item) {
                    currentCount = rows[x].stock_quantity;
                }
            }

            var newInventoryCount = parseInt(answer.newInventory) + parseInt(currentCount);
            connection.query("UPDATE products SET stock_quantity = ? WHERE product_name = ?", [newInventoryCount, answer.item], err => {
                if (err) throw err;
                console.log("Successfully updated the quantity of", answer.item, "from", currentCount, "to", newInventoryCount);
                connection.end();
            });  // end of updating stock quantity
        }); // end of inquirer
    });  // end of getting all products with quantity less than 6
}

function addNewProduct() {
    console.log("Attempting to add a new product to the database...");
    connection.query("SELECT department_name FROM departments", (err, rows) => {
        var deparments = rows.map(a => a.department_name);
        inquirer.prompt([
            {
                type: "input",
                message: "What is the product name?",
                name: "productName"
            },
            {
                type: "list",
                message: "What department is this item located in?",
                choices: deparments,
                name: "department"
            },
            {
                type: "input",
                message: "What is the price of this item?",
                name: "price",
                validate: (value => {
                    if (isNaN(value) == false) return true;
                    else return false;
                })
            },
            {
                type: "input",
                message: "How much stock do you currently have?",
                name: "stock",
                validate: (value => {
                    if (isNaN(value) == false) return true;
                    else return false;
                })
            },
        ]).then(answer => {
            connection.query("INSERT INTO products SET ?",
                {
                    product_name: answer.productName,
                    department_name: answer.department,
                    price: answer.price,
                    stock_quantity: answer.stock
                }, err => {
                    if (err) throw err;
                    console.log("Successfully added product:", answer.productName + ", department:", answer.department + ", price: $" + answer.price + ", quantity:", answer.stock);
                    connection.end();
                });
        });
    });
}