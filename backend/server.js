const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());


const userRoutes = require('./routes/userRoutes');
app.use('/api/admin', userRoutes); //connection with router, prefixing all routes with /api/admin


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

