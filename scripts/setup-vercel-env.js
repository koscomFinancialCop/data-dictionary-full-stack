// This script sets up environment variables for Vercel build
// It ensures DIRECT_URL is set if not provided

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  // If DIRECT_URL is not set, use DATABASE_URL as fallback
  // This is safe for build time since we're not running migrations
  process.env.DIRECT_URL = process.env.DATABASE_URL;
  console.log('✅ DIRECT_URL set from DATABASE_URL for build');
}

// Ensure required environment variables are set
const requiredEnvVars = ['DATABASE_URL'];
const optionalEnvVars = [
  'RAG_WEBHOOK_URL',
  'RAG_TIMEOUT',
  'RAG_MAX_RETRIES',
  'ENABLE_RAG_SUGGESTIONS',
  'RAG_MIN_CONFIDENCE'
];

// Check required variables
const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingRequired.length > 0) {
  console.error('❌ Missing required environment variables:', missingRequired.join(', '));
  process.exit(1);
}

// Set defaults for optional variables
const defaults = {
  'RAG_WEBHOOK_URL': 'https://koscom.app.n8n.cloud/webhook/invoke',
  'RAG_TIMEOUT': '30000',
  'RAG_MAX_RETRIES': '3',
  'ENABLE_RAG_SUGGESTIONS': 'false',
  'RAG_MIN_CONFIDENCE': '0.7'
};

optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    process.env[varName] = defaults[varName];
    console.log(`ℹ️  Using default value for ${varName}: ${defaults[varName]}`);
  }
});

console.log('✅ All environment variables are configured');