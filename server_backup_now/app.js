const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('TrialSage is running in emergency mode');
});

app.listen(3000, () => {
  console.log('Emergency app running on port 3000');
});

