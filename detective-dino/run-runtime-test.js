// Node.js script to run the runtime test
const http = require('http');

console.log('Fetching runtime test page from http://localhost:8000/runtime-test.html...\n');

http.get('http://localhost:8000/runtime-test.html', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✓ Runtime test page loaded successfully (HTTP 200)');
      console.log('\nTo view the test results, open this URL in your browser:');
      console.log('http://localhost:8000/runtime-test.html');
      console.log('\nOr open the actual game at:');
      console.log('http://localhost:8000/index.html');
    } else {
      console.log(`✗ Failed to load page (HTTP ${res.statusCode})`);
    }
  });

}).on('error', (err) => {
  console.log(`✗ Error: ${err.message}`);
  console.log('\nMake sure the server is running:');
  console.log('python -m http.server 8000');
});
