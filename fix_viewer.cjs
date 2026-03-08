const fs = require('fs');

let viewerContent = fs.readFileSync('src/components/Viewer3DTab.jsx', 'utf8');

// The issue was:
// import React, { useState, useEffect, useRef } from 'react';
// , { useEffect, useRef, useState } from 'react';
viewerContent = viewerContent.replace(
    /\n\s*,\s*\{ useEffect, useRef, useState \} from 'react';/,
    ''
);

fs.writeFileSync('src/components/Viewer3DTab.jsx', viewerContent);
