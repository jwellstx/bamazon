SET SQL_SAFE_UPDATES = 0;

DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
use bamazon;

CREATE TABLE products (
	item_id INTEGER NOT NULL auto_increment primary key,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price decimal(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    product_sales decimal(10,2) DEFAULT 0
);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES
	("Toilet Paper", "Household Items", "10.50", "1", "4500"),
    ("Ipad", "Electronics", "600.00", "4", "8000"),
    ("Pizza", "Groceries", "15.99", "200", "875"),
    ("Shampoo", "Household Items", "7.98", "250", "4000"),
    ("Shirt", "Clothing", "20.99", "300", "2375"),
    ("DVD", "Electronics", "12.01", "2", "1765"),
    ("Puzzle", "Entertainment", "11.50", "35", "650"),
    ("Hot Pockets", "Groceries", "4.75", "2", "9540"),
    ("Paper Towels", "Household Items", "8.50", "600", "14560"),
    ("Jeans", "Clothing", "25.00", "175", "84");

CREATE TABLE departments (
	department_id INTEGER NOT NULL auto_increment PRIMARY KEY,
    department_name VARCHAR(30) NOT NULL,
    over_head_costs decimal(10,2)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES
	("Household Items", "2000"),
    ("Electronics", "5000"),
    ("Groceries", "3000"),
    ("Clothing", "1500"),
    ("Entertainment", "2000");