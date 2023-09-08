const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express();
const port = 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the "public" directory
app.use(express.static('public'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});
const upload = multer({ storage: storage });

wss.on('connection', (ws) => {
    app.post('/upload', upload.single('video'), (req, res) => {
        if (!req.file) {
            return res.json({ message: 'Please upload a file!' });
        }

        const inputFilePath = req.file.path;
        const outputFilePath = `converted/${Date.now()}.mp4`;

        ffmpeg(inputFilePath)
            .toFormat('mp4')
            .on('progress', (progress) => {
                ws.send(JSON.stringify({ progress: progress.percent }));
            })
            .on('end', () => {
                res.json({ message: 'Conversion finished. Download your file [here](' + outputFilePath + ').' });
            })
            .on('error', (err) => {
                console.error(err);
                res.json({ message: 'Error during conversion. Please try again.' });
            })
            .save(outputFilePath);
    });
});

server.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
