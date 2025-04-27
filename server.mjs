import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'trialsage.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`TrialSage server running on http://0.0.0.0:${port}`);
  console.log('Open the Webview or Open Website button in Replit to view the app');
});
