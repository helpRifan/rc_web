const https = require('https');
https.get('https://chennai.vit.ac.in/member/dr-arockia-selvakumar/', { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/<img[^>]*src="([^"]+)"[^>]*>/g);
    console.log(matches ? matches.join('\n') : 'No images found');
  });
}).on('error', err => console.error(err));
