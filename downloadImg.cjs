const https = require('https');
const fs = require('fs');

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

const file = fs.createWriteStream("public/arockia.jpg");
https.get('https://chennai.vit.ac.in/wp-content/uploads/2020/09/50444.jpg', { rejectUnauthorized: false }, (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download Completed');
  });
}).on('error', err => {
  fs.unlink("public/arockia.jpg", () => {});
  console.error(err);
});
