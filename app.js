const http = require('http');
var fs = require('fs')
    , jp = require('jsonpath');

const hostname = '192.168.1.156';
const port = 3000;

var main_dishes;

const server = http.createServer((req, res) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html;charset=UTF-8');

    var result = '<html>';
    result += '<body>';

    result += '<table>';

    var choices = getRandomInts(main_dishes.length, 10);

    for (var i = 0; i < choices.length; i++) {

        var dish = main_dishes[choices[i]];

        var ingredientsList = "(";

        for (var j = 0; j < dish.ingredients.length; j++){

            var ingredient = dish.ingredients[j];

            if (j > 0){
                ingredientsList += ", ";
            }

            ingredientsList +=  (ingredient.amount > 0 ? ingredient.amount + " " : "") + (ingredient.unit ? (ingredient.amount > 1 ? ingredient.unit.plural : ingredient.unit.name) : '') + " " +  ingredient.prepend + " " + (ingredient.amount > 1 ? ingredient.product.plural : ingredient.product.name)
        }

        ingredientsList += ")";

        result += '<tr>';

        result += '<td><img src=\"' + dish.img + '\" width=\"250\"/></td>';

        result += '<td><a href=\"https://dagelijksekost.een.be' + dish.url + '\">' + dish.title + '</a> (' + dish.time + ' - ' + dish.persons + ' personen)</td>'

        result += '<td>' + ingredientsList + '</td>'

        result += '</tr>';

    }

    result += '</table>';

    result + '</body>';

    result += '</html>';

    res.end(result);

});

server.listen(port, hostname, () => {
    
    var dishes = JSON.parse(fs.readFileSync('dagelijksekost.json', 'utf8'));
    main_dishes = jp.query(dishes, "$..dishes[?(@.category_primary == 'Hoofdgerecht')]");

    console.log(`Server running at http://${hostname}:${port}/`);

});

function getRandomInts(max, count) {
    var result = new Array();
    for (var i = 0; i < count; i++) {
        let num = Math.floor(Math.random() * max)
        result.push(num);
    }
    return result;
}

function getDish(url) {
    console.log('calling dish');
}