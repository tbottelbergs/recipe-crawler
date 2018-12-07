const https = require('https');
const http = require('http');
var xpath = require('xpath')
    , dom = require('xmldom').DOMParser
    , request = require('request')
    , async = require('async')

const hostname = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html;charset=UTF-8');

    var result = '<html>';
    result += '<body>';

    request('https://dagelijksekost.een.be/az-index', function (error, response, body) {

        var doc = new dom().parseFromString(body);

        /*function printNode(node, prefix){
            console.log(prefix + node.nodeName)
        
            if(node.hasChildNodes()){
        
                for(var i = 0; i < node.childNodes.length; i++){
                    if(node.childNodes[i].nodeType == 1){
                        printNode(node.childNodes[i], "\t" + prefix)
                    } else {
                        console.log("not printing " + node.childNodes[i].nodeName)
                    }
                }
            }
        }
        
        printNode(doc.documentElement, "")*/

        var nodes = xpath.select("//main[@id='main']/div/script", doc)

        var scriptContent = nodes[0].textContent
        var json = JSON.parse(scriptContent.substring(21, scriptContent.length - 2))

        var choices = getRandomInt(json.dishes.length, 10);

        result += '<table>';

        for (var i = 0; i < choices.length; i++) {
            
        }

        async.each(choices, function (choice, callback) {
            
            var dish = json.dishes[choice];
            console.log(dish);
            request('https://dagelijksekost.een.be' + dish.url, function (error, response, body) {

                result += '<tr>';

                var dish_doc = new dom().parseFromString(body);

                var img = xpath.select("//div[@class='dish-playground__images']/img", dish_doc)[0];
                var time = xpath.select("//div[i[@class = 'fas fa-clock']]", dish_doc)[0];

                result += '<td><img src=\"' + img.getAttribute('src') + '\" width=\"250\"/></td>';

                result += '<td><a href=\"https://dagelijksekost.een.be' + dish.url + '\">' + dish.title + '</a> (' + time.textContent + ')</td>'

                result += '</tr>';

                callback();
            });
        }, function (err) {
            console.log('done')
            result += '</table>';
            result += '</body>';
            result += '</html>';
            res.end(result);
        });
    });

});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function getRandomInt(max, count) {
    var result = new Array();
    for (var i = 0; i < count; i++) {
        let num = Math.floor(Math.random() * max)
        result.push(num);
    }
    return result;
}

function getDish(url){
    console.log('calling dish');
}