require("dotenv").config();
var ctable = require("console.table")
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: process.env.DB_PASSWORD,
    database: "bamazon"
});

var connection2 = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: process.env.DB_PASSWORD,
    database: "bamazon"
});


var deptId = [];
var department = [];
var itemsByDept = [];

connection.connect();
connection.query('select * from department', function (error, results, fields) {
    if (error) throw error;
    for (var i = 0; i < results.length; i++) {
        department.push(results[i].dept_name)
    };
    for (var x = 0; x < results.length; x++) {
        deptId.push(results[x].dept_id)
    }

});

var addItems = function () {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'itemDescription',
                message: 'What new item would you like to add?'
            },
            {
                type: 'list',
                name: 'department',
                message: 'What department does this item belong to?',
                choices: department
            },
            {
                type: 'input',
                name: 'price',
                message: 'Price:',
                validate: function (input) {
                    var done = this.async();
                    setTimeout(function () {
                        if (parseFloat(input) != input) {
                            done("You must set item's price to a number");
                            return;
                        }
                        done(null, true);
                    }, 1000)
                }
            },
            {
                type: 'input',
                name: 'quanity',
                message: 'Quanity:',
                validate: function (input) {
                    var done = this.async();
                    setTimeout(function () {
                        if (parseFloat(input) != input) {
                            done("You must set item's quanity to a number");
                            return;
                        }
                        done(null, true);
                    }, 1000)
                }
            }
        ])
        .then(answers => {
            var sql = "INSERT INTO items (dept_id, description, item_price, quanity) VALUES ?"
            var values = [
                [deptId[department.indexOf(answers.department)], answers.itemDescription, parseFloat(answers.price).toFixed(2), parseInt(answers.quanity)]
            ];
            connection.query(sql, [values], function (err, result) {
                if (err) throw (err);
                console.log("Number of records inserted: " + result.affectedRows)
            })
            connection.end();

        })
};

var viewAllItems = function () {
    department.push('View All')
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'department',
                message: 'Which department would you like to see available items?',
                choices: department
            }
        ])
        .then(answers => {
            var sql = 'SELECT d.dept_name, i.description, i.item_price, i.quanity FROM items i ' +
                'INNER JOIN department d ON d.dept_id = i.dept_id'
            if (answers.department !== 'View All') {
                sql = 'SELECT d.dept_name, i.description, i.item_price, i.quanity FROM items i ' +
                    'INNER JOIN department d ON d.dept_id = i.dept_id ' +
                    'WHERE i.dept_id = ' + deptId[department.indexOf(answers.department)]
            }
            connection.query(sql, function (err, result) {
                if (err) throw (err);
                console.table(result)
            })
            connection.end();

        })
}

var viewLowInventory = function () {
    department.push('View All')
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'department',
                message: 'Which department would you like to see items with low inventory',
                choices: department
            }
        ])
        .then(answers => {
            var sql = 'SELECT d.dept_name, i.description, i.item_price, i.quanity FROM items i ' +
                'INNER JOIN department d ON d.dept_id = i.dept_id ' +
                'WHERE i.quanity < 10'
            if (answers.department !== 'View All') {
                sql = 'SELECT d.dept_name, i.description, i.item_price, i.quanity FROM items i ' +
                    'INNER JOIN department d ON d.dept_id = i.dept_id ' +
                    'WHERE i.dept_id = ' + deptId[department.indexOf(answers.department)] +
                    ' AND i.quanity < 10'
            }
            connection.query(sql, function (err, result) {
                if (err) throw (err);
                console.table(result)
            })
            connection.end();

        })
}

var AddInventory = function () {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'department',
                message: 'Which department is your item in?',
                choices: department
            }
        ])
        .then(answers => {
            var sql = 'SELECT i.description FROM items i ' +
                'WHERE i.dept_id = ' + deptId[department.indexOf(answers.department)]
                connection.query(sql, function (err, result) {
                    if (err) throw (err);
                    for (var i = 0; i < result.length; i++) {
                        itemsByDept.push(result[i].description)
                    };
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name:'item',
                                message: 'Which Item would you like to add Inventory to?',
                                choices: itemsByDept
                            },
                            {
                                type: 'input',
                                name: 'addQuanity',
                                message: 'How many would you like to add?',
                                validate: function (input) {
                                    var done = this.async();
                                    setTimeout(function () {
                                        if (parseFloat(input) != input) {
                                            done("You must set item's quanity to a number");
                                            return;
                                        }
                                        done(null, true);
                                    }, 1000)
                                }                
                            }
                        ])
                        .then(answers => {
                            var sql = "SET SQL_SAFE_UPDATES = 0; " + 
                            "UPDATE items SET quanity = ? WHERE description like ?"
                            connection2.query(sql, [parseInt(answers.addQuanity), answers.item], function (err, result){
                                if (err) throw(err);
                            })
                            connection2.end()
                            console.log(parseInt(answers.addQuanity) + ' units have been added to the item ' + answers.item)
                        }) 
                })
            connection.end();

        })
}


inquirer
    .prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What action would you like to take?',
            choices: [
                'Add New Product',
                'View Items For Sale',
                'View Low Inventory',
                'Add to inventory'
            ]
        }
    ])
    .then(answers => {
        if (answers.action === 'Add New Product') {
            console.log('Add New Product');
            addItems();
        }
        else if (answers.action === 'View Items For Sale') {
            console.log('View Items For Sale');
            viewAllItems();
        }
        if (answers.action === 'View Low Inventory') {
            console.log('View Low Inventory');
            viewLowInventory();
        }
        if (answers.action === 'Add to inventory') {
            console.log('Add to inventory');
            AddInventory();
        }
    });