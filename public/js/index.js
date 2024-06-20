import fs from 'fs';
import https from 'https';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import axios from 'axios';
import FormData from 'form-data';
import exp from 'constants';
import cors from 'cors';

// __dirname을 ES 모듈에서 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../')));

// 루트 경로에 대한 요청을 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});


// JWT token as a constant
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYWJhY2Y4ZS1mNmQxLTRiNDUtOGZjZS05MGJlMjRlOTJiM2MiLCJlbWFpbCI6Im5heWoyODQyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0ZTNkZTMyZGZjYTg3NDdhYTM4NiIsInNjb3BlZEtleVNlY3JldCI6ImQxZTZmMGM2ZGFmM2Y3YWEzNzZiNDI5MzQ3NTYyMjA2ZmRjN2I4MjY3ZDY2MWE1ZWYxYmM5MTAyZTQyODg3NjEiLCJpYXQiOjE3MTg2MTczMTR9.nWYlouump08hSrX0lh-M6ozxfYCPyh2oT-tL5KHKhYU'

app.use(cors());

app.use(bodyParser.json({ limit: '55mb' }));
app.use(bodyParser.urlencoded({ limit: '55mb', extended: true }));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.array('file', 6), async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.path));

      const pinataMetadata = JSON.stringify({ name: file.originalname });
      formData.append('pinataMetadata', pinataMetadata);

      const pinataOptions = JSON.stringify({ cidVersion: 0 });
      formData.append('pinataOptions', pinataOptions);

      const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${JWT}`,
        },
      });

      return pinataRes.data;
    });

    const results = await Promise.all(uploadPromises);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  
// HTTPS 서버 생성 및 실행
https.createServer({
  key: fs.readFileSync('localhost.key'),
  cert: fs.readFileSync('localhost.crt')
}, app).listen(3000, '0.0.0.0', () => {
  console.log('HTTPS server running on https://localhost:3000 !');
});
