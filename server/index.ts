import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const libraryDir = path.join(__dirname, 'library');
const tracksPath = path.join(libraryDir, 'tracks.json');
const audioDir = path.join(libraryDir, 'audio');
const lyricsDir = path.join(libraryDir, 'lyrics');

app.get('/api/tracks', (_req, res) => {
  try {
    if (!fs.existsSync(tracksPath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(tracksPath, 'utf-8');
    const tracks = JSON.parse(data);
    res.json(tracks);
  } catch (err) {
    console.error('Error reading tracks:', err);
    res.status(500).json({ error: 'Failed to read tracks' });
  }
});

app.use('/media/audio', (_req, _res, next) => {
  next();
}, express.static(audioDir));

app.use('/media/lyrics', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  if (ext === '.lrc') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  }
  next();
}, express.static(lyricsDir));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Audio directory: ${audioDir}`);
  console.log(`Lyrics directory: ${lyricsDir}`);
});
