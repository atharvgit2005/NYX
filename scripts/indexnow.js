/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');

const payload = JSON.stringify({
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

const endpoints = [
  { hostname: 'api.indexnow.org', path: '/indexnow' },
  { hostname: 'www.bing.com', path: '/indexnow' }
];

endpoints.forEach(({ hostname, path }) => {
  const options = {
    hostname,
    port: 443,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`[IndexNow - Brave/Bing] ${hostname} status: ${res.statusCode}`);
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error(`[IndexNow - Brave/Bing] ${hostname} error:`, error.message);
  });

  req.write(payload);
  req.end();
});

