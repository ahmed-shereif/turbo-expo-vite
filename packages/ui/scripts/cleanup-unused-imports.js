#!/usr/bin/env node

/**
 * Cleanup Unused Imports Script
 * 
 * This script removes unused shadow component imports that were added by the migration script
 * but are not actually being used in the files.
 */

const fs = require('fs');
const path = require('path');

function cleanupFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Pattern to match shadow component imports
    const shadowImportPattern = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"`]@repo\/ui['"`]/g;
    
    const match = content.match(shadowImportPattern);
    if (match) {
      const importLine = match[0];
      const imports = importLine.match(/\{([^}]+)\}/)[1];
      const importList = imports.split(',').map(imp => imp.trim());
      
      // Shadow components that might be unused
      const shadowComponents = ['ShadowView', 'CardShadow', 'ButtonShadow', 'ModalShadow', 'FloatingShadow'];
      
      // Check which shadow components are actually used in the file
      const usedShadowComponents = shadowComponents.filter(component => {
        const componentPattern = new RegExp(`<${component}\\b`, 'g');
        return componentPattern.test(content);
      });
      
      // Remove unused shadow components from imports
      const filteredImports = importList.filter(imp => {
        if (shadowComponents.includes(imp)) {
          return usedShadowComponents.includes(imp);
        }
        return true; // Keep non-shadow imports
      });
      
      if (filteredImports.length !== importList.length) {
        const newImportLine = `import { ${filteredImports.join(', ')} } from '@repo/ui'`;
        content = content.replace(importLine, newImportLine);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned up imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning up ${filePath}:`, error.message);
    return false;
  }
}

function findTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function main() {
  const webDir = '/home/ahmed/p1-sessions/apps/turbo-expo-vite/apps/web/src';
  const mobileDir = '/home/ahmed/p1-sessions/apps/turbo-expo-vite/apps/mobile/src';
  
  console.log('🧹 Starting cleanup of unused shadow imports...\n');
  
  let totalFiles = 0;
  let cleanedFiles = 0;
  
  // Process web app
  if (fs.existsSync(webDir)) {
    console.log('📱 Processing web app...');
    const webFiles = findTsxFiles(webDir);
    totalFiles += webFiles.length;
    
    webFiles.forEach(file => {
      if (cleanupFile(file)) {
        cleanedFiles++;
      }
    });
  }
  
  // Process mobile app
  if (fs.existsSync(mobileDir)) {
    console.log('📱 Processing mobile app...');
    const mobileFiles = findTsxFiles(mobileDir);
    totalFiles += mobileFiles.length;
    
    mobileFiles.forEach(file => {
      if (cleanupFile(file)) {
        cleanedFiles++;
      }
    });
  }
  
  console.log(`\n✨ Cleanup complete!`);
  console.log(`📊 Processed ${totalFiles} files`);
  console.log(`🧹 Cleaned up ${cleanedFiles} files`);
}

if (require.main === module) {
  main();
}

module.exports = { cleanupFile, findTsxFiles };

