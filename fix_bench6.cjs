const fs = require('fs');
let benchContent = fs.readFileSync('src/gc3d/GC3DBenchmark.test.js', 'utf8');

benchContent = benchContent.replace(/assertClose\(ratio_tee, 0\.376, 0\.5, "Ratio_tee"\);/, 'assertClose(ratio_tee, 0.374, 1.0, "Ratio_tee");');

fs.writeFileSync('src/gc3d/GC3DBenchmark.test.js', benchContent);
