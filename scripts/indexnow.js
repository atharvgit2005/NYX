/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');

const data = JSON.stringify({
  host: "www.nyxstudio.in",
  key: "9bcc7db8-7719-4cb7-84a6-c839582cdb91",
  keyLocation: "https://www.nyxstudio.in/9bcc7db8-7719-4cb7-84a6-c839582cdb91.txt",
  urlList: [
    "https://www.nyxstudio.in/",
    "https://www.nyxstudio.in/about",
    "https://www.nyxstudio.in/work",
    "https://www.nyxstudio.in/services",
    "https://www.nyxstudio.in/contact",
    "https://www.nyxstudio.in/glossary"
  ]
});

const options = {
  hostname: 'api.indexnow.org',
  port: 443,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`IndexNow status: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('IndexNow error:', error);
});

req.write(data);
req.end();
