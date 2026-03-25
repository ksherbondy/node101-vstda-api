const express = require('express');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
const app = express();



// add your code here
app.use(logRequests);

/**
 * GET ROUTES
 */
app.get('/', (req, res) => {
    // Return status and obj to the client
    res.status(200).json({status: 'ok'});
});

app.get('/api/TodoItems', async (req, res) => {
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

app.get('/api/TodoItems/:number', async (req, res) => {
    // Expects all TODO items from array & status 200
    try {
        // Grab the id using params where :number from the route is the param identifier and type
        const itemNum = req.params.number;
        // Read and parse data in the contents of data.json
        const todos = await getJSONData();
        const item = todos[itemNum];
        if (!item) {
            return res.status(404).send('Item not found');
        }
        // Return what the client asked for
        res.status(200).json(item);
    } catch (err) {
        next(err);
    }
});

/**
 * POST ROUTES
 */
app.post('/api/TodoItems', (req, res) => {
    // Log the event or is this already logged in app.use()?
    
    // Push the new TODO item onto the array in the json file.
   
    // Expects the item pushed and status of 201
    res.status(201);
});


/**
 * DELETE ROUTES
 */


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

module.exports = app;
