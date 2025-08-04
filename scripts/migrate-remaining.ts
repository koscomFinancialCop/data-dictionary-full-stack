const { PrismaClient } = require('@prisma/client');

// Local database
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://gundorit@localhost:5432/data_dictionary'
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

async function migrateRemaining() {
  console.log('🚀 Migrating remaining data...');

  try {
    // Get all local data
    const localData = await localPrisma.variableMapping.findMany({
      orderBy: { createdAt: 'asc' }
    });
    console.log(`📊 Local data: ${localData.length} items`);

    // Get existing remote data IDs
    const remoteData = await prodPrisma.variableMapping.findMany({
      select: { id: true }
    });
    const remoteIds = new Set(remoteData.map((d: any) => d.id));
    console.log(`📊 Remote data: ${remoteData.length} items`);

    // Filter data that doesn't exist in remote
    const toMigrate = localData.filter((item: any) => !remoteIds.has(item.id));
    console.log(`📊 To migrate: ${toMigrate.length} items`);

    // Migrate in batches
    const batchSize = 50;
    let migrated = 0;

    for (let i = 0; i < toMigrate.length; i += batchSize) {
      const batch = toMigrate.slice(i, i + batchSize);
      
      // Use createMany for better performance
      await prodPrisma.variableMapping.createMany({
        data: batch,
        skipDuplicates: true
      });
      
      migrated += batch.length;
      console.log(`✅ Migrated ${migrated}/${toMigrate.length} items...`);
    }

    // Final count
    const finalCount = await prodPrisma.variableMapping.count();
    console.log(`\n✅ Migration complete! Total items in remote: ${finalCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run migration
migrateRemaining().catch(console.error);