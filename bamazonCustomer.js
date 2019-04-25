//dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "127.0.0.1",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password & database info
    password: "",
    database: "bamazon"
});


//Running the application will first display all of the items available for sale, including the ids, names, and prices of products for sale.
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    displayProducts();
});

//the function that displays to the customer all items available for sale (ids, product names and prices)
function displayProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log("ID #: " + res[i].item_id + " " + "Product: " + res[i].product_name + " | " + "Department: " + res[i].department_name + " | " + "Price: " + res[i].price);
        };
        userPrompt();
    });
};
//The app should then prompt users with two messages:
//The first should ask them the ID of the product they would like to buy
//The second message should ask how many units of the product they would like to buy.
function userPrompt() {
    inquirer.prompt([
        {
            name: "item_id",
            type: "input",
            message: "Welcome to Bamazon! Please enter the ID # of the product you would like to purchase:",
        },
        {
            name: "item_quantity",
            type: "input",
            message: "Great! How many of these would you like to purchase?",
        }
    ]).then(function (input) {
        var userChoice = input.item_id;
        var userAmount = input.item_quantity;
        //the queryDb will check the bamazon db to make sure the item ID # exists with the quantity requested
        var queryDb = "SELECT * FROM products WHERE ?";

        connection.query(queryDb, { item_id: userChoice }, function (err, data) {
            if (err) throw err;
            //if the user enters a number that isn't part of the ID #s, they will receive this message and the products will display again
            if (data.length === 0) {
                console.log("Oops! Please enter a valid ID # from the product list:");
                displayProducts();
            } else {
                var productInfo = data[0];

                if (userAmount <= productInfo.stock_quantity) {
                    console.log("Thank you for your purchase!");

                    var updateDb = "UPDATE products SET stock_quantity = " + (productInfo.stock_quantity - userAmount) + " WHERE item_id = " + userChoice;
                    //console.log(updateDb);

                    connection.query(updateDb, function (err, data) {
                        if (err) throw err;

                        console.log("Your order has been successfully placed! Your total comes out to $" + productInfo.price * userAmount);
                        console.log("Thank you for shopping with Bamazon!")
                        connection.end();
                    })
                } else {
                    console.log("Sorry - we do not have that many in stock for the product you choice.")
                    console.log("Please adjust the quantity requested.")

                    displayProducts();
                };
            };
        });
    });
};