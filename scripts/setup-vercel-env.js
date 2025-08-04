// This script sets up environment variables for Vercel build
// It ensures DIRECT_URL is set if not provided

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  // If DIRECT_URL is not set, use DATABASE_URL as fallback
  // This is safe for build time since we're not running migrations
  process.env.DIRECT_URL = process.env.DATABASE_URL;
  console.log('✅ DIRECT_URL set from DATABASE_URL for build');
}

// Ensure all required environment variables are set
const requiredEnvVars = [
  'DATABASE_URL',
  'RAG_WEBHOOK_URL',
  'RAG_TIMEOUT',
  'RAG_MAX_RETRIES',
  'ENABLE_RAG_SUGGESTIONS',
  'RAG_MIN_CONFIDENCE'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

console.log('✅ All required environment variables are set');