## Bamazon! Created by jwellstx

An Amazon like database used to manage products, product prices, current stock, prices and profit.  Play the role of either a customer to purchase products, Manager to manage inventory or supervisor to monitor costs.  

This tools was created to exercise the use of the `mysql` node package to do database queries to either display information, add new data or update existing data.

## Demo
![bamazon demo](/assets/Images/bamazon.gif)

## Setup Instructions
1. Clone the repo
2. run `npm install` to install all node dependencies
3. update `mysql_credentials.js` to include your login credentials to your mysql DB
4. Setup your MySQL DB by executing the SQL commands inside `./assets/mysql_setup/bamazon.sql` in MySQL Workbench
5. Execute on of the following commands:
   1. `node ./bamazonCustomer.js` to purchase items
   2. `node ./bamazonManager.js` to view items, view low inventory, add inventory or add a new product
   3. `node ./bamazonSupervisor.js` to view product sales by department or create a new department
6. Enjoy!
