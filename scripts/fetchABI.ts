import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONTRACTS_OUT_DIR = join(__dirname, '../contracts/out');
const OUTPUT_DIR = join(__dirname, '../src/libs');

// Convert contract name to camelCase for export
function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// Recursive function to find all JSON files
function findJsonFiles(dir: string, fileList: string[] = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json') && !file.endsWith('.metadata.json')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Process ABI files
function extractABIs() {
  console.log('🔍 Searching for contract JSON files...\n');

  // Get all JSON files in the contracts output directory recursively
  const files = findJsonFiles(CONTRACTS_OUT_DIR);

  console.log(`Found ${files.length} contract files:\n`);

  files.forEach(filePath => {
    try {
      // Read the JSON file
      const contractData = JSON.parse(readFileSync(filePath, 'utf-8'));

      // Extract contract name from filename
      const fileName = filePath.split('/').pop() || '';
      const contractName = fileName.replace('.json', '');

      // Get the ABI
      const abi = contractData.abi;

      if (!abi || !Array.isArray(abi) || abi.length === 0) {
        // Skip files without ABI or empty ABI (like interfaces sometimes or abstract contracts)
        return;
      }

      // Create the TypeScript file content
      const exportName = `${toCamelCase(contractName)}ABI`;
      const tsContent = `export const ${exportName} =\n${JSON.stringify(abi, null, 2)} as const;\n`;

      // Write to output file
      const outputPath = join(OUTPUT_DIR, `${toCamelCase(contractName)}ABI.ts`);
      writeFileSync(outputPath, tsContent, 'utf-8');

      console.log(`✅ ${contractName}`);
      console.log(`   📝 Created: ${toCamelCase(contractName)}ABI.ts`);
      console.log(`   📦 Export: ${exportName}\n`);

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
    }
  });

  console.log('\n✨ ABI extraction complete!\n');
}

// Run the script
extractABIs();
