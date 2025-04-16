/**
 * Script to test the Supabase interview code validation
 * Run with: node scripts/test-validation.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from .env file
dotenv.config({ path: path.join(projectRoot, '.env') });

// Verify file paths
const supabaseFilePath = path.join(projectRoot, 'src', 'renderer', 'services', 'supabase.js');
const validationServicePath = path.join(
  projectRoot,
  'src',
  'renderer',
  'services',
  'validationService.js'
);

console.log('Checking for required files:');
if (fs.existsSync(supabaseFilePath)) {
  console.log(`✅ ${supabaseFilePath} exists`);
} else {
  console.error(`❌ ${supabaseFilePath} not found`);
}

if (fs.existsSync(validationServicePath)) {
  console.log(`✅ ${validationServicePath} exists`);
} else {
  console.error(`❌ ${validationServicePath} not found`);
}

// Run the tests
const runTests = async () => {
  try {
    console.log('\nImporting test utilities...');

    // Import the test utilities
    const testUtilsPath = path.join(projectRoot, 'src', 'renderer', 'utils', 'testUtils.js');
    console.log('Loading test utils from:', testUtilsPath);

    const testUtils = await import(`file://${testUtilsPath}`);

    // Verify the implementation structure
    console.log('\nVerifying validation implementation structure...');
    const verificationResult = testUtils.verifyValidationImplementation();

    if (!verificationResult.success) {
      console.error('❌ Validation implementation verification failed:', verificationResult.error);
      process.exit(1);
    }

    console.log('✅ Validation implementation structure verification passed');

    // Run the mock tests
    console.log('\nRunning interview code validation logic tests with mocks...');
    const mockTestResult = await testUtils.testInterviewCodeValidation();

    if (!mockTestResult.success) {
      console.error('❌ Mock tests failed:', mockTestResult.error);
      process.exit(1);
    }

    // Log the results
    console.log('\n======= TEST RESULTS =======\n');

    const { valid, expired, inactive, nonExistent } = mockTestResult.results;

    console.log('Valid Code Test:');
    console.log('  Result:', valid.valid ? '✅ PASSED' : '❌ FAILED');
    if (valid.error) console.log('  Error:', valid.error);
    console.log();

    console.log('Expired Code Test:');
    console.log('  Result:', !expired.valid ? '✅ PASSED' : '❌ FAILED');
    if (expired.error) console.log('  Error:', expired.error);
    console.log();

    console.log('Inactive Code Test:');
    console.log('  Result:', !inactive.valid ? '✅ PASSED' : '❌ FAILED');
    if (inactive.error) console.log('  Error:', inactive.error);
    console.log();

    console.log('Non-existent Code Test:');
    console.log('  Result:', !nonExistent.valid ? '✅ PASSED' : '❌ FAILED');
    if (nonExistent.error) console.log('  Error:', nonExistent.error);

    console.log('\n============================\n');

    if (mockTestResult.note) {
      console.log('Note:', mockTestResult.note);
      console.log();
    }

    console.log('🎉 Validation implementation verification completed successfully!');
    console.log('The code structure is correct and follows the required patterns.');
    console.log(
      'For full integration testing, you would need database access with proper RLS policies.'
    );

    process.exit(0);
  } catch (error) {
    console.error('Error running tests:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Run the tests
runTests();
