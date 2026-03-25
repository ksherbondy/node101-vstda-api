const express = require('express');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const bodyparser = require('body-parser');



// add your code here
app.use(logRequests);
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

/**
 * GET ROUTES
 */
app.get('/', (req, res) => {
    // Return status and obj to the client
    res.status(200).json({status: 'ok'});
});

app.get('/api/TodoItems', async (req, res, next) => {
    // Expects all TODO items from array & status 200
    try {
        // Read and parse in the contents of data.json
        const todos = await getJSONData();
        // Return what the client asked for
        res.status(200).json(todos);
    } catch (err) {
        next(err);
    }
});

app.get('/api/TodoItems/:number', async (req, res, next) => {
    // Expects all TODO items from array & status 200
    try {
        // Grab the id using params where :number from the route is the param identifier and type
        const itemNum = parseInt(req.params.number);
        // Read and parse data in the contents of data.json
        const todos = await getJSONData();
        const item = todos.find(todo => todo.todoItemId === itemNum);
        // Return what the client asked for
        if (!item) {
            return res.status(404).send('Item not found');
        }
        res.status(200).json(item);
    } catch (err) {
        next(err);
    }
});

/**
 * POST ROUTES
 */
app.post('/api/TodoItems', async (req, res, next) => {
    const postItem = req.body;
    const todos = await getJSONData();
    // Push the new TODO item onto the array in the json file.
    await saveJSONData(postItem, todos);
    res.status(201).json(postItem);
    
    // Expects the item pushed and status of 201
    
});


/**
 * DELETE ROUTES
 */
app.delete('/api/TodoItems/:number', async (req, res, next) => {
    const deleteId = parseInt(req.params.number);
    const todos = await getJSONData();
    const deleteResp = todos[deleteId];
    // Delete the TODO item from the array in the json file.
    await deleteJSONData(deleteId, todos);
    res.status(200).json(deleteResp);    
});

/**
 * FAIL ROUTE
 */
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Creating own Middleware function to log all requests
async function logRequests(req, res, next) {
    res.on('finish', async () => {
        const agent = req.headers['user-agent'].replaceAll(/,/g, '');
        const time = new Date().toISOString();
        const method = req.method;
        const resource = req.url;
        const version = 'HTTP/' + req.httpVersion;
        const status = res.statusCode;
        const logLine = `${agent},${time},${method},${resource},${version},${status}\n`;
        const logFilePath = path.join(__dirname, '..', 'log.csv');
        try {
            await fs.appendFile(logFilePath, logLine);
        } catch (err) {
            console.error('Logging failed:', err);
        }
    });
    next();    
}

async function getJSONData() {
    const fileData = await fs.readFile('./data.json', 'utf8');
    const todos = JSON.parse(fileData);
    return todos;
}

async function saveJSONData(obj, array) {
    let newTodo = obj;
    array.push(newTodo);
    await fs.writeFile('./data.json', JSON.stringify(array, null, 2));
}

async function deleteJSONData(objNum, array) {
    let deleteObj = objNum;
    let newObjArray = array.filter(item => item.todoItemId !== deleteObj);
    await fs.writeFile('./data.json', JSON.stringify(newObjArray, null, 2));
    
}

module.exports = app;
