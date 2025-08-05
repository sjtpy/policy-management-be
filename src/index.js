const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

app.use(express.json());

app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app }; 