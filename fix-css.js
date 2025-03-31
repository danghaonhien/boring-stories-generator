const fs = require('fs');

// Write App.css
fs.writeFileSync('src/App.css', '/* Custom styles beyond Tailwind can go here */', 'utf8');

// Write index.css
fs.writeFileSync('src/index.css', '@tailwind base;\n@tailwind components;\n@tailwind utilities;', 'utf8');

console.log('CSS files fixed with proper encoding'); 