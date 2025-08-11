#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Rwanda Safe Pay development environment...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Function to run command and handle errors
const runCommand = (command, cwd = process.cwd()) => {
  try {
    console.log(`📦 Running: ${command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed to run: ${command}`);
    console.error(error.message);
    return false;
  }
};

// Check if required tools are installed
const checkRequiredTools = () => {
  console.log('\n🔍 Checking required tools...');
  
  const tools = [
    { name: 'Git', command: 'git --version' },
    { name: 'Node.js', command: 'node --version' },
    { name: 'npm', command: 'npm --version' }
  ];

  for (const tool of tools) {
    try {
      execSync(tool.command, { stdio: 'pipe' });
      console.log(`✅ ${tool.name} is installed`);
    } catch (error) {
      console.error(`❌ ${tool.name} is not installed or not in PATH`);
      return false;
    }
  }
  
  return true;
};

// Install dependencies for all components
const installDependencies = () => {
  console.log('\n📦 Installing dependencies...');
  
  const components = [
    { name: 'Root', path: '.' },
    { name: 'Backend', path: './backend' },
    { name: 'Mobile App', path: './mobile-app' },
    { name: 'Web Dashboard', path: './web-dashboard' }
  ];

  for (const component of components) {
    console.log(`\n📦 Installing ${component.name} dependencies...`);
    
    if (!fs.existsSync(path.join(component.path, 'package.json'))) {
      console.log(`⚠️  No package.json found for ${component.name}, skipping...`);
      continue;
    }

    if (!runCommand('npm install', component.path)) {
      console.error(`❌ Failed to install dependencies for ${component.name}`);
      return false;
    }
    
    console.log(`✅ ${component.name} dependencies installed`);
  }
  
  return true;
};

// Create environment files
const createEnvironmentFiles = () => {
  console.log('\n🔧 Setting up environment files...');
  
  const envFiles = [
    {
      source: './backend/.env.example',
      target: './backend/.env',
      name: 'Backend environment'
    }
  ];

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile.source) && !fs.existsSync(envFile.target)) {
      try {
        fs.copyFileSync(envFile.source, envFile.target);
        console.log(`✅ Created ${envFile.name} file: ${envFile.target}`);
        console.log(`⚠️  Please update ${envFile.target} with your actual configuration values`);
      } catch (error) {
        console.error(`❌ Failed to create ${envFile.name} file:`, error.message);
      }
    } else if (fs.existsSync(envFile.target)) {
      console.log(`✅ ${envFile.name} file already exists: ${envFile.target}`);
    }
  }
};

// Main setup function
const main = async () => {
  try {
    console.log('🇷🇼 Rwanda Safe Pay Development Setup\n');
    
    // Check required tools
    if (!checkRequiredTools()) {
      console.error('\n❌ Setup failed: Missing required tools');
      process.exit(1);
    }

    // Install dependencies
    if (!installDependencies()) {
      console.error('\n❌ Setup failed: Dependency installation failed');
      process.exit(1);
    }

    // Create environment files
    createEnvironmentFiles();

    console.log('\n🎉 Development environment setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Update backend/.env with your Firebase and API keys');
    console.log('2. Set up Firebase project and download service account key');
    console.log('3. Configure payment gateway credentials');
    console.log('4. Run "npm run dev" to start development servers');
    console.log('\n📚 Documentation:');
    console.log('- API Documentation: docs/API_DOCUMENTATION.md');
    console.log('- Architecture: docs/PROJECT_ARCHITECTURE.md');
    console.log('- README: README.md');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
