const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());                      // 🟢 This must come before your routes
app.use(express.static('public'));            // Serve your frontend from /public

app.post('/store_data', (req, res) => {
    const userDetails = req.body;
    console.log(userDetails);

    const filePath = path.join(__dirname, 'store_data.json');

    fs.readFile(filePath, 'utf-8', (err, data) => {
        let jsonData = { stores: [], lastFetched: null };

        if (!err && data) {
            jsonData = JSON.parse(data);
        }

        jsonData.stores.push(userDetails);
        jsonData.lastFetched = new Date().toISOString();

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).send('Error saving data');
            } else {
                console.log('Data saved successfully.');
                res.send({ status: 'Data saved' });
            }
        });
    });
});

app.get('/get_data', (req, res) => {
    const filePath = path.join(__dirname, 'store_data.json');

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading data');
        }

        res.type('application/json').send(data);
    });
});

app.listen(port, '0.0.0.0',() => {
    console.log(`Server is running at http://localhost:${port}`);
});
