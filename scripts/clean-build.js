#!/usr/bin/env node

/**
 * Clean build directories before building
 * Handles Windows-specific ENOTEMPTY errors when removing directories
 */

const fs = require('fs');
const path = require('path');

function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  try {
    // Use recursive option for Node.js 12.10+
    if (fs.rmSync) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } else {
      // Fallback for older Node.js versions
      fs.rmdirSync(dirPath, { recursive: true });
    }
    console.log(`✓ Cleaned: ${dirPath}`);
  } catch (error) {
    // If directory is locked (Windows/OneDrive), try multiple times
    if (error.code === 'ENOTEMPTY' || error.code === 'EPERM' || error.code === 'EBUSY') {
      console.warn(`⚠ Warning: Could not remove ${dirPath} (may be locked by OneDrive)`);
      console.warn(`  Error: ${error.message}`);
      console.warn(`  You may need to exclude .next folder from OneDrive sync`);
    } else {
      throw error;
    }
  }
}

function cleanBuildDirs() {
  const projectRoot = path.resolve(__dirname, '..');
  const nextDir = path.join(projectRoot, '.next');
  const exportDir = path.join(nextDir, 'export');
  const outDir = path.join(projectRoot, 'out');

  console.log('Cleaning build directories...\n');

  // Clean .next/export directory first (most common issue)
  if (fs.existsSync(exportDir)) {
    console.log(`Removing ${exportDir}...`);
    removeDir(exportDir);
  }

  // Clean out directory if it exists
  if (fs.existsSync(outDir)) {
    console.log(`Removing ${outDir}...`);
    removeDir(outDir);
  }

  console.log('\n✓ Build directories cleaned\n');
}

try {
  cleanBuildDirs();
} catch (error) {
  console.error('Error cleaning build directories:', error.message);
  process.exit(1);
}

