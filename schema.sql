DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

create table items (
item_id int auto_increment,
department_id int,
description varchar(500),
item_price decimal(15,2),
quanity int,
primary key (id)
);

create table department (
id int auto_increment,
dept_name varchar (500),
primary key (id)
);
