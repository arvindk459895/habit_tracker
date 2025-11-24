/**
 * Store Migration Utility
 * 
 * Provides version management and automatic migration for Zustand stores
 * to prevent data loss when schemas change.
 */

export interface MigrationFunction<T = any> {
    version: number;
    migrate: (oldData: T) => T;
    description: string;
}

export interface MigrationConfig<T = any> {
    storeName: string;
    currentVersion: number;
    migrations: MigrationFunction<T>[];
}

/**
 * Backs up data to localStorage before migration
 */
export const backupData = (storeName: string, data: any): void => {
    try {
        const backupKey = `${storeName}-backup-${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
        console.log(`✅ Backup created: ${backupKey}`);

        // Keep only last 3 backups to avoid filling storage
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys
            .filter(key => key.startsWith(`${storeName}-backup-`))
            .sort()
            .reverse();

        backupKeys.slice(3).forEach(key => localStorage.removeItem(key));
    } catch (error) {
        console.error('Failed to create backup:', error);
    }
};

/**
 * Main migration runner
 */
export const migrateStore = <T extends { version?: number }>(
    config: MigrationConfig<T>,
    persistedData: T | null
): T | null => {
    if (!persistedData) {
        console.log(`📦 No existing data for ${config.storeName}`);
        return null;
    }

    const dataVersion = persistedData.version || 0;

    if (dataVersion === config.currentVersion) {
        console.log(`✅ ${config.storeName} is up to date (v${dataVersion})`);
        return persistedData;
    }

    console.log(`🔄 Migrating ${config.storeName} from v${dataVersion} to v${config.currentVersion}`);

    // Create backup before migration
    backupData(config.storeName, persistedData);

    try {
        let migratedData = { ...persistedData };

        // Run all migrations in order from dataVersion to currentVersion
        const applicableMigrations = config.migrations.filter(
            m => m.version > dataVersion && m.version <= config.currentVersion
        ).sort((a, b) => a.version - b.version);

        for (const migration of applicableMigrations) {
            console.log(`  ⚙️  Running migration v${migration.version}: ${migration.description}`);
            migratedData = migration.migrate(migratedData);
            migratedData.version = migration.version;
        }

        console.log(`✅ Migration complete: ${config.storeName} is now v${config.currentVersion}`);
        return migratedData;

    } catch (error) {
        console.error(`❌ Migration failed for ${config.storeName}:`, error);
        console.log('💾 Attempting to restore from backup...');

        // Try to restore from most recent backup
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys
            .filter(key => key.startsWith(`${config.storeName}-backup-`))
            .sort()
            .reverse();

        if (backupKeys.length > 0) {
            try {
                const backup = localStorage.getItem(backupKeys[0]);
                if (backup) {
                    console.log(`✅ Restored from ${backupKeys[0]}`);
                    return JSON.parse(backup);
                }
            } catch (restoreError) {
                console.error('❌ Failed to restore backup:', restoreError);
            }
        }

        // If all else fails, return original data
        return persistedData;
    }
};

/**
 * Utility to get the latest backup for a store
 */
export const getLatestBackup = (storeName: string): any | null => {
    try {
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys
            .filter(key => key.startsWith(`${storeName}-backup-`))
            .sort()
            .reverse();

        if (backupKeys.length > 0) {
            const backup = localStorage.getItem(backupKeys[0]);
            return backup ? JSON.parse(backup) : null;
        }
        return null;
    } catch (error) {
        console.error('Failed to get backup:', error);
        return null;
    }
};
