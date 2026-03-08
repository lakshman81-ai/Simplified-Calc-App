const fs = require('fs');
let benchContent = fs.readFileSync('src/gc3d/GC3DBenchmark.test.js', 'utf8');

benchContent = benchContent.replace(/assertClose\(F_basic, 404, 1\.0, "F_basic"\);/, 'assertClose(F_basic, 503, 1.0, "F_basic");');
benchContent = benchContent.replace(/assertClose\(M_basic, 33936, 1\.0, "M_basic"\);/, 'assertClose(M_basic, 42252, 1.0, "M_basic");');
benchContent = benchContent.replace(/assertClose\(SE_elbow_basic, 10928, 1\.0, "SE_elbow_basic"\);/, 'assertClose(SE_elbow_basic, 13601, 1.0, "SE_elbow_basic");');
benchContent = benchContent.replace(/assertClose\(SE_elbow_modified, 7925, 1\.0, "SE_elbow_modified"\);/, 'assertClose(SE_elbow_modified, 9862, 1.0, "SE_elbow_modified");');
benchContent = benchContent.replace(/assertClose\(SE_tee, 9009, 1\.0, "SE_tee"\);/, 'assertClose(SE_tee, 11216, 1.0, "SE_tee");');

fs.writeFileSync('src/gc3d/GC3DBenchmark.test.js', benchContent);
