import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONTRACTS_OUT_DIR = join(__dirname, '../contracts/out');
const OUTPUT_DIR = join(__dirname, '../src/libs');
const DEPLOYMENT_CONFIG_PATH = join(__dirname, 'deployment-addresses.json');
const ENV_FILE_PATH = join(__dirname, '../.env.local');

// Contract names we care about for the invoice system
const TARGET_CONTRACTS = ['IdentityRegistry', 'InvoiceToken', 'InvoiceVault'];

interface DeploymentAddresses {
  [contractName: string]: string;
}

// Convert contract name to camelCase for export
function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// Convert contract name to UPPER_SNAKE_CASE for env vars
function toUpperSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '');
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

// Load deployment addresses from config file or command line
function loadDeploymentAddresses(): DeploymentAddresses {
  const addresses: DeploymentAddresses = {};

  // First, try to load from deployment config file
  if (existsSync(DEPLOYMENT_CONFIG_PATH)) {
    try {
      const config = JSON.parse(readFileSync(DEPLOYMENT_CONFIG_PATH, 'utf-8'));
      Object.assign(addresses, config);
      console.log('📋 Loaded addresses from deployment-addresses.json\n');
    } catch (error) {
      console.warn('⚠️  Could not read deployment-addresses.json:', error);
    }
  }

  // Override with command line arguments if provided
  // Format: npm run fetch-abi -- --IdentityRegistry=0x... --InvoiceToken=0x...
  const args = process.argv.slice(2);
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (key && value && value.startsWith('0x')) {
        addresses[key] = value;
      }
    }
  });

  return addresses;
}

// Update or create .env.local file with contract addresses
function updateEnvFile(addresses: DeploymentAddresses) {
  let envContent = '';

  // Read existing .env.local if it exists
  if (existsSync(ENV_FILE_PATH)) {
    envContent = readFileSync(ENV_FILE_PATH, 'utf-8');
  }

  // Update or add each contract address
  Object.entries(addresses).forEach(([contractName, address]) => {
    const envVarName = `VITE_${toUpperSnakeCase(contractName)}_ADDRESS`;
    const envLine = `${envVarName}=${address}`;

    const regex = new RegExp(`^${envVarName}=.*$`, 'm');
    if (regex.test(envContent)) {
      // Update existing line
      envContent = envContent.replace(regex, envLine);
    } else {
      // Add new line
      envContent += envContent.endsWith('\n') ? envLine + '\n' : '\n' + envLine + '\n';
    }
  });

  writeFileSync(ENV_FILE_PATH, envContent, 'utf-8');
  console.log('✅ Updated .env.local with contract addresses\n');
}

// Generate contracts.ts config file
function generateContractsConfig(addresses: DeploymentAddresses, processedContracts: string[]) {
  let imports = '';
  let contractsObj = '';

  processedContracts.forEach(contractName => {
    const camelName = toCamelCase(contractName);
    const abiExportName = `${camelName}ABI`;

    imports += `import { ${abiExportName} } from './${abiExportName}';\n`;

    const address = addresses[contractName] || '';
    contractsObj += `  ${contractName}: {\n`;
    contractsObj += `    address: '${address}' as \`0x\${string}\`,\n`;
    contractsObj += `    abi: ${abiExportName},\n`;
    contractsObj += `  },\n`;
  });

  const configContent = `// Auto-generated contract configuration
// Generated on: ${new Date().toISOString()}
${imports}
export const contracts = {
${contractsObj}} as const;

// Export individual addresses for convenience
${processedContracts.map(name => {
  const address = addresses[name] || '';
  return `export const ${toUpperSnakeCase(name)}_ADDRESS = '${address}' as \`0x\${string}\`;`;
}).join('\n')}
`;

  const outputPath = join(OUTPUT_DIR, 'contracts.ts');
  writeFileSync(outputPath, configContent, 'utf-8');
  console.log('✅ Generated contracts.ts configuration file\n');
}

// Process ABI files
function extractABIs() {
  console.log('🔍 Searching for contract JSON files...\n');

  // Load deployment addresses
  const deploymentAddresses = loadDeploymentAddresses();

  if (Object.keys(deploymentAddresses).length > 0) {
    console.log('📍 Deployment addresses:');
    Object.entries(deploymentAddresses).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });
    console.log('');
  } else {
    console.log('⚠️  No deployment addresses provided. Contracts will have empty addresses.\n');
    console.log('💡 Tip: Provide addresses via deployment-addresses.json or command line:\n');
    console.log('   npm run fetch-abi -- --IdentityRegistry=0x... --InvoiceToken=0x...\n');
  }

  // Get all JSON files in the contracts output directory recursively
  const files = findJsonFiles(CONTRACTS_OUT_DIR);
  const processedContracts: string[] = [];

  console.log(`Found ${files.length} contract files. Processing target contracts...\n`);

  files.forEach(filePath => {
    try {
      // Read the JSON file
      const contractData = JSON.parse(readFileSync(filePath, 'utf-8'));

      // Extract contract name from filename
      const fileName = filePath.split('/').pop() || '';
      const contractName = fileName.replace('.json', '');

      // Only process target contracts (or all if none specified)
      if (TARGET_CONTRACTS.length > 0 && !TARGET_CONTRACTS.includes(contractName)) {
        return;
      }

      // Get the ABI
      const abi = contractData.abi;

      if (!abi || !Array.isArray(abi) || abi.length === 0) {
        return;
      }

      // Create the TypeScript file content
      const exportName = `${toCamelCase(contractName)}ABI`;
      const tsContent = `export const ${exportName} =\n${JSON.stringify(abi, null, 2)} as const;\n`;

      // Write to output file
      const outputPath = join(OUTPUT_DIR, `${toCamelCase(contractName)}ABI.ts`);
      writeFileSync(outputPath, tsContent, 'utf-8');

      processedContracts.push(contractName);

      console.log(`✅ ${contractName}`);
      console.log(`   📝 Created: ${toCamelCase(contractName)}ABI.ts`);
      console.log(`   📦 Export: ${exportName}\n`);

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
    }
  });

  if (processedContracts.length === 0) {
    console.log('⚠️  No contracts were processed. Check your contract compilation.\n');
    return;
  }

  // Generate contracts configuration file
  generateContractsConfig(deploymentAddresses, processedContracts);

  // Update .env.local file if we have addresses
  if (Object.keys(deploymentAddresses).length > 0) {
    updateEnvFile(deploymentAddresses);
  }

  console.log('✨ ABI extraction complete!\n');
  console.log(`📦 Processed ${processedContracts.length} contracts: ${processedContracts.join(', ')}\n`);
}

// Run the script
extractABIs();
