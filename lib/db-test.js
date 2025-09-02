import { db } from './prisma';

export const testDatabaseConnection = async () => {
  try {
    // Test the database connection
    await db.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'P1001') {
      console.error('💡 This usually means:');
      console.error('   1. The database server is not running');
      console.error('   2. The DATABASE_URL is incorrect');
      console.error('   3. Network connectivity issues');
      console.error('   4. SSL/TLS configuration problems');
    }
    
    return false;
  } finally {
    await db.$disconnect();
  }
};

export const checkEnvironmentVariables = () => {
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('💡 Please create a .env.local file with the required variables');
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
};
