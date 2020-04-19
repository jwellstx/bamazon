var inquirer = require('inquirer');
var connection = require('./mysql_credentials.js').connection;

connection.connect(err => { if (err) throw err; supervisor(); });

function supervisor() {
    // Ask the supervisor if they want to view product sales or create new department
    // then call corresponding function
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
}

function viewProductSalesByDepartment() {
    // Merge the 2 tables using right join, display profits on the fly and group by department
    console.log("Attemping to view Product Sales by Department...");

    query = "SELECT departments.department_id AS \"ID\", departments.department_name AS \"Department\", SUM(departments.over_head_costs) AS \"Overhead Costs\", ";
    query += "SUM(products.product_sales) AS \"Product Sales\", SUM(products.product_sales - departments.over_head_costs) AS \"Total Profit\" ";
    query += "FROM products RIGHT JOIN departments ON products.department_name=departments.department_name GROUP BY departments.department_name"

    connection.query(query,
        (err, rows) => {
            // log merged tables
            console.table(rows);
        });
    connection.end();
}

function createNewDepartment() {
    // Ask supervisor what the department name is and the est overhead costs
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
                if (isNaN(value) == false && value > 0) return true;
                else return true;
            }
        }
    ]).then(answer => {
        // create new department in departments DB
        connection.query("INSERT INTO departments SET ?", [
            {
                department_name: answer.department,
                over_head_costs: answer.ohc
            }
        ], err => {
            if (err) throw err;
            console.log("Successfully create new department,", answer.department + ", with overhead costs of, $" + answer.ohc);
            printUpdatedResultsDepartment();
            connection.end();
        });
    });
}

function printUpdatedResultsDepartment() {
    // Helper function to simply display information from DB to the console
    connection.query("SELECT * FROM departments", (err, rows) => {
        if (err) throw err;
        console.table(rows, ['department_name', 'over_head_costs']);
    });
}