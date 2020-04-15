var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "utcodingcamp",
    database: "bamazon"
});

connection.connect(err => { if (err) throw err });

inquirer.prompt([
    {
        type: "list",
        message: "Which action would you like to take?",
        choices: ["View Product Sales by Department", "Create New Department"],
        name: "option"
    }
]).then(answer => {
    switch (answer.option) {
        case "View Product Sales by Department":
            viewProductSalesByDepartment();
            break;
        case "Create New Department":
            createNewDepartment();
            break;
        default:
            console.log("No action available.."); // should not hit
    }
});

function viewProductSalesByDepartment() {
    console.log("Attemping to view Product Sales by Department...");

    query = "SELECT departments.department_id AS \"ID\", departments.department_name AS \"Department\", SUM(departments.over_head_costs) AS \"Overhead Costs\", ";
    query += "SUM(products.product_sales) AS \"Product Sales\", SUM(products.product_sales - departments.over_head_costs) AS \"Total Cost\" ";
    query += "FROM products INNER JOIN departments ON products.department_name=departments.department_name GROUP BY departments.department_name"

    connection.query(query, 
    (err, rows) => {
        console.table(rows);
    });
    connection.end();
}

function createNewDepartment() {
    console.log("Attempting to create a new Department...");
    inquirer.prompt([
        {
            type: "input",
            message: "What is the new department type?",
            name: "department"
        },
        {
            type: "Input",
            message: "What is the estimated overhead costs?",
            name: "ohc",
            validate: (value) => {
                if (isNaN(value) == false) return true;
                else return true;
            }
        }
    ]).then(answer => {
        connection.query("INSERT INTO departments SET ?", [
            {
                department_name: answer.department,
                over_head_costs: answer.ohc
            }
        ], err => {
            if (err) throw err;
            console.log("Successfully create new department,", answer.department + ", with overhead costs of, $" + answer.ohc);
            connection.end();
        });
    });
}