#!/usr/bin/env node

/**
 * Verification script to check if all required component files exist
 * Run this before deploying to VPS: node scripts/verify-components.js
 */

const fs = require('fs');
const path = require('path');

const requiredComponents = [
  'src/components/ui/breadcrumb.tsx',
  'src/components/ui/separator.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/badge.tsx',
  'src/components/shared/Section.tsx',
  'src/components/shared/RichTextContent.tsx',
];

let allExist = true;

console.log('🔍 Verifying component files...\n');

requiredComponents.forEach((componentPath) => {
  const fullPath = path.join(process.cwd(), componentPath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`✅ ${componentPath}`);
  } else {
    console.log(`❌ ${componentPath} - MISSING!`);
    allExist = false;
  }
});

console.log('');

if (allExist) {
  console.log('✅ All required components exist!');
  process.exit(0);
} else {
  console.log('❌ Some components are missing. Please check the files above.');
  process.exit(1);
}

