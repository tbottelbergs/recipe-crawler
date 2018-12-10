/*
    Code to retrieve all the recipees of dagelijksekost.een.be and save them as a json file 'dagelijksekost.json'
*/

var xpath = require('xpath')
    , dom = require('xmldom').DOMParser
    , request = require('request')
    , async = require('async')
    , fs = require('fs');

// Retrieve all recipees
request('https://dagelijksekost.een.be/az-index', function (error, response, body) {

    var index_doc = new dom().parseFromString(body);

    var index_script_node = xpath.select("//main[@id='main']/div/script", index_doc, true);

    var index_script = index_script_node.textContent;

    var dishes_json = JSON.parse(index_script.substring(21, index_script.length - 2));

    async.eachLimit(dishes_json.dishes, 10, function (dish, callback) {

        request('https://dagelijksekost.een.be' + dish.url, function (error, response, body) {
            
            console.log("Retrieving recipe for dish " + dish.id + " - " + dish.title);

            var dish_doc = new dom().parseFromString(body);
            
            var dish_script = xpath.select("//main[@id='main']/div/script", dish_doc, true).textContent.trim();
            
            var dish_ingredients = JSON.parse(dish_script.substring(18, dish_script.indexOf("var accesories") - 6));

            var dish_forFixedPersons = dish_script.substring(dish_script.indexOf("var dishForFixedPersons") + 26, dish_script.indexOf("var dishFixedPersons") - 6)

            var dish_persons = dish_script.substring(dish_script.indexOf("var dishFixedPersons") + 23, dish_script.length - 1);

            dish.ingredients = dish_ingredients;
            dish.forFixedPersons = dish_forFixedPersons;
            dish.persons = dish_persons;

            var dish_window_script = xpath.select("//html/head/script[contains(.,'window.digitalData')]", dish_doc, true).textContent.trim();

            dish.label = dish_window_script.match(/(?<=label: ').*(?=',)/)[0];
            dish.duration = dish_window_script.match(/(?<=recipe_duration: ).*(?=,)/)[0];
            dish.category_primary = dish_window_script.match(/(?<=category_primary: ').*(?=',)/)[0];
            dish.category_secondary = dish_window_script.match(/(?<=category_secondary: ').*(?=',)/)[0];

            var dish_img_node = xpath.select("//div[@class='dish-playground__images']/img", dish_doc, true);
            
            var dish_img = dish_img_node.getAttribute('src');
            
            dish.img = dish_img;

            var dish_time = xpath.select("//div[i[@class = 'fas fa-clock']]", dish_doc, true).textContent.trim();

            dish.duration_text = dish_time;

            callback();
        });
    }, function (err) {
        console.log('done');
        fs.writeFile('dagelijksekost.json', JSON.stringify(dishes_json), 'utf8', function(){});
    });
});
