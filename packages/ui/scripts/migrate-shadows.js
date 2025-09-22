#!/usr/bin/env node

/**
 * Shadow Migration Script
 * 
 * This script helps migrate inline shadow properties to the new shadow system.
 * It provides patterns and examples for common shadow usage patterns.
 */

const fs = require('fs');
const path = require('path');

// Common shadow patterns to replace
const shadowPatterns = [
  // Basic shadow patterns
  {
    pattern: /shadowColor:\s*['"`]\$primary['"`],?\s*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*2\s*\},?\s*shadowOpacity:\s*0\.15,?\s*shadowRadius:\s*4,?\s*elevation:\s*2/g,
    replacement: '// Use <ButtonShadow color="primary" level="sm"> instead'
  },
  {
    pattern: /shadowColor:\s*['"`]\$secondary['"`],?\s*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*2\s*\},?\s*shadowOpacity:\s*0\.15,?\s*shadowRadius:\s*4,?\s*elevation:\s*2/g,
    replacement: '// Use <ButtonShadow color="secondary" level="sm"> instead'
  },
  {
    pattern: /shadowColor:\s*['"`]\$color8['"`],?\s*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*2\s*\},?\s*shadowOpacity:\s*0\.08,?\s*shadowRadius:\s*6,?\s*elevation:\s*3/g,
    replacement: '// Use <CardShadow level="md"> instead'
  },
  {
    pattern: /shadowColor:\s*['"`]\$color8['"`],?\s*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*4\s*\},?\s*shadowOpacity:\s*0\.12,?\s*shadowRadius:\s*8,?\s*elevation:\s*4/g,
    replacement: '// Use <CardShadow level="lg"> instead'
  },
  
  // Box shadow patterns
  {
    pattern: /style:\s*\{\s*boxShadow:\s*['"`]0\s+4px\s+16px\s+rgba\(0,0,0,0\.12\)['"`]\s*\}/g,
    replacement: '// Use <CardShadow level="md"> instead'
  },
  {
    pattern: /style:\s*\{\s*boxShadow:\s*['"`]0\s+8px\s+24px\s+rgba\(0,0,0,0\.16\)['"`]\s*\}/g,
    replacement: '// Use <CardShadow level="lg"> instead'
  },
  
  // Hover state patterns
  {
    pattern: /hoverStyle:\s*\{[^}]*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*4\s*\}[^}]*\}/g,
    replacement: 'hoverStyle: { scale: 1.02 } // Shadow handled by ShadowView'
  },
  
  // Press state patterns
  {
    pattern: /pressStyle:\s*\{[^}]*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*1\s*\}[^}]*\}/g,
    replacement: 'pressStyle: { scale: 0.98 } // Shadow handled by ShadowView'
  }
];

// Import patterns to add
const importPatterns = [
  {
    pattern: /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"`]@repo\/ui['"`]/,
    replacement: (match, imports) => {
      const currentImports = imports.split(',').map(imp => imp.trim());
      const shadowImports = ['ShadowView', 'CardShadow', 'ButtonShadow', 'ModalShadow', 'FloatingShadow'];
      const newImports = [...new Set([...currentImports, ...shadowImports])];
      return `import { ${newImports.join(', ')} } from '@repo/ui'`;
    }
  }
];

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply shadow pattern replacements
    shadowPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        hasChanges = true;
      }
    });
    
    // Apply import pattern replacements
    importPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Migrated shadows in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
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
  
  console.log('🚀 Starting shadow migration...\n');
  
  let totalFiles = 0;
  let migratedFiles = 0;
  
  // Process web app
  if (fs.existsSync(webDir)) {
    console.log('📱 Processing web app...');
    const webFiles = findTsxFiles(webDir);
    totalFiles += webFiles.length;
    
    webFiles.forEach(file => {
      if (migrateFile(file)) {
        migratedFiles++;
      }
    });
  }
  
  // Process mobile app
  if (fs.existsSync(mobileDir)) {
    console.log('📱 Processing mobile app...');
    const mobileFiles = findTsxFiles(mobileDir);
    totalFiles += mobileFiles.length;
    
    mobileFiles.forEach(file => {
      if (migrateFile(file)) {
        migratedFiles++;
      }
    });
  }
  
  console.log(`\n✨ Migration complete!`);
  console.log(`📊 Processed ${totalFiles} files`);
  console.log(`🔄 Migrated ${migratedFiles} files`);
  console.log(`\n📝 Next steps:`);
  console.log(`1. Review the changes and replace commented patterns with proper ShadowView components`);
  console.log(`2. Test the visual appearance across web and mobile`);
  console.log(`3. Remove any remaining inline shadow properties`);
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, findTsxFiles, shadowPatterns, importPatterns };
