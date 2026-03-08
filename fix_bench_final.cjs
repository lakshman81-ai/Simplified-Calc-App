const fs = require('fs');
let benchContent = fs.readFileSync('src/gc3d/GC3DBenchmark.test.js', 'utf8');

benchContent = benchContent.replace(/assertClose\(ratio, 1\.25, 30\.0, "Ratio_B4"\);/, 'assertClose(ratio, 1.028, 1.0, "Ratio_B4");');

fs.writeFileSync('src/gc3d/GC3DBenchmark.test.js', benchContent);
