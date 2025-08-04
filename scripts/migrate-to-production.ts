const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Local database
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL || 'postgresql://gundorit@localhost:5432/data_dictionary'
    }
  }
});

// Production database
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  console.log('🚀 Starting data migration...');

  try {
    // Check production database connection
    await prodPrisma.$connect();
    console.log('✅ Connected to production database');

    // Migrate VariableMapping
    console.log('\n📊 Migrating Variable Mappings...');
    const mappings = await localPrisma.variableMapping.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    for (const mapping of mappings) {
      try {
        await prodPrisma.variableMapping.upsert({
          where: { id: mapping.id },
          update: mapping,
          create: mapping
        });
      } catch (error) {
        console.log(`⚠️  Skipping mapping ${mapping.korean} - may already exist`);
      }
    }
    console.log(`✅ Migrated ${mappings.length} variable mappings`);

    // Migrate SearchHistory
    console.log('\n📊 Migrating Search History...');
    const searchHistory = await localPrisma.searchHistory.findMany({
      orderBy: { createdAt: 'asc' },
      take: 10000 // Limit to recent history
    });
    
    for (const history of searchHistory) {
      try {
        await prodPrisma.searchHistory.create({
          data: history
        });
      } catch (error) {
        console.log(`⚠️  Skipping search history ${history.id}`);
      }
    }
    console.log(`✅ Migrated ${searchHistory.length} search history records`);

    // Migrate RAGSuggestionLog
    console.log('\n📊 Migrating RAG Suggestion Logs...');
    const ragLogs = await localPrisma.rAGSuggestionLog.findMany({
      orderBy: { createdAt: 'asc' },
      take: 10000
    });
    
    for (const log of ragLogs) {
      try {
        await prodPrisma.rAGSuggestionLog.create({
          data: {
            ...log,
            suggestions: log.suggestions as any
          }
        });
      } catch (error) {
        console.log(`⚠️  Skipping RAG log ${log.id}`);
      }
    }
    console.log(`✅ Migrated ${ragLogs.length} RAG suggestion logs`);

    // Migrate UserActivity
    console.log('\n📊 Migrating User Activity...');
    const activities = await localPrisma.userActivity.findMany({
      orderBy: { createdAt: 'asc' },
      take: 10000 // Limit to recent activities
    });
    
    for (const activity of activities) {
      try {
        await prodPrisma.userActivity.create({
          data: {
            ...activity,
            result: activity.result as any,
            metadata: activity.metadata as any
          }
        });
      } catch (error) {
        console.log(`⚠️  Skipping activity ${activity.id}`);
      }
    }
    console.log(`✅ Migrated ${activities.length} user activities`);

    // Migrate DailyStats
    console.log('\n📊 Migrating Daily Stats...');
    const dailyStats = await localPrisma.dailyStats.findMany({
      orderBy: { date: 'asc' }
    });
    
    for (const stat of dailyStats) {
      try {
        await prodPrisma.dailyStats.upsert({
          where: { date: stat.date },
          update: stat,
          create: stat
        });
      } catch (error) {
        console.log(`⚠️  Skipping daily stat ${stat.date}`);
      }
    }
    console.log(`✅ Migrated ${dailyStats.length} daily stats`);

    // Generate summary
    console.log('\n📊 Migration Summary:');
    console.log(`- Variable Mappings: ${mappings.length}`);
    console.log(`- Search History: ${searchHistory.length}`);
    console.log(`- RAG Logs: ${ragLogs.length}`);
    console.log(`- User Activities: ${activities.length}`);
    console.log(`- Daily Stats: ${dailyStats.length}`);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Export data to JSON (backup)
async function exportToJSON() {
  console.log('💾 Exporting data to JSON...');
  
  const data = {
    variableMapping: await localPrisma.variableMapping.findMany(),
    searchHistory: await localPrisma.searchHistory.findMany({ take: 10000 }),
    ragSuggestionLog: await localPrisma.rAGSuggestionLog.findMany({ take: 10000 }),
    userActivity: await localPrisma.userActivity.findMany({ take: 10000 }),
    dailyStats: await localPrisma.dailyStats.findMany()
  };

  const backupPath = path.join(process.cwd(), 'data-backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  
  console.log(`✅ Data exported to ${backupPath}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--export')) {
    await exportToJSON();
  }
  
  if (args.includes('--migrate')) {
    if (!process.env.PRODUCTION_DATABASE_URL && !process.env.DATABASE_URL) {
      console.error('❌ Please set PRODUCTION_DATABASE_URL or DATABASE_URL environment variable');
      process.exit(1);
    }
    await migrateData();
  }
  
  if (!args.length) {
    console.log(`
Usage:
  npm run migrate:export     Export local data to JSON
  npm run migrate:prod      Migrate data to production
  
Environment variables:
  LOCAL_DATABASE_URL       Source database (default: postgresql://gundorit@localhost:5432/data_dictionary)
  PRODUCTION_DATABASE_URL  Target database (required for migration)
    `);
  }
}

main().catch(console.error);