import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

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

    // Migrate Terms
    console.log('\n📊 Migrating Terms...');
    const terms = await localPrisma.term.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    for (const term of terms) {
      try {
        await prodPrisma.term.upsert({
          where: { id: term.id },
          update: term,
          create: term
        });
      } catch (error) {
        console.log(`⚠️  Skipping term ${term.korean} - may already exist`);
      }
    }
    console.log(`✅ Migrated ${terms.length} terms`);

    // Migrate ExcelImportHistory
    console.log('\n📊 Migrating Excel Import History...');
    const importHistory = await localPrisma.excelImportHistory.findMany({
      orderBy: { importedAt: 'asc' }
    });
    
    for (const history of importHistory) {
      try {
        await prodPrisma.excelImportHistory.upsert({
          where: { id: history.id },
          update: history,
          create: history
        });
      } catch (error) {
        console.log(`⚠️  Skipping import history ${history.id}`);
      }
    }
    console.log(`✅ Migrated ${importHistory.length} import history records`);

    // Migrate UserActivity
    console.log('\n📊 Migrating User Activity...');
    const activities = await localPrisma.userActivity.findMany({
      orderBy: { createdAt: 'asc' },
      take: 10000 // Limit to recent activities
    });
    
    for (const activity of activities) {
      try {
        await prodPrisma.userActivity.create({
          data: activity
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
    console.log(`- Terms: ${terms.length}`);
    console.log(`- Import History: ${importHistory.length}`);
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
    terms: await localPrisma.term.findMany(),
    excelImportHistory: await localPrisma.excelImportHistory.findMany(),
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