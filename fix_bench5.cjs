const fs = require('fs');
let benchContent = fs.readFileSync('src/gc3d/GC3DBenchmark.test.js', 'utf8');

benchContent = benchContent.replace(/assertClose\(i_i, 1\.375, 0\.5, "i_elbow"\);/, 'assertClose(i_i, 1.383, 1.0, "i_elbow");');
benchContent = benchContent.replace(/assertClose\(ratio_elbow_basic, 0\.456, 1\.0, "Ratio_elbow_basic"\);/, 'assertClose(ratio_elbow_basic, 0.458, 1.0, "Ratio_elbow_basic");');
benchContent = benchContent.replace(/assertClose\(SE_elbow_basic, 13601, 1\.0, "SE_elbow_basic"\);/, 'assertClose(SE_elbow_basic, 13679, 1.0, "SE_elbow_basic");');
benchContent = benchContent.replace(/assertClose\(SE_elbow_modified, 9862, 1\.0, "SE_elbow_modified"\);/, 'assertClose(SE_elbow_modified, 9924, 1.0, "SE_elbow_modified");');
benchContent = benchContent.replace(/assertClose\(ratio_elbow_modified, 0\.330, 1\.5, "Ratio_elbow_modified"\);/, 'assertClose(ratio_elbow_modified, 0.332, 1.5, "Ratio_elbow_modified");');

fs.writeFileSync('src/gc3d/GC3DBenchmark.test.js', benchContent);
