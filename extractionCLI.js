const { ExtractionEngine } = require('./core/extractionEngine');
const { itemConfigs } = require('./config/itemConfigs');

class ExtractionCLI {
    constructor() {
        this.availableTypes = Object.keys(itemConfigs);
    }

    showHelp() {
        console.log(`
🎮 Game Data Extraction CLI
===========================

Usage: node extractionCLI.js [command] [options]

Commands:
  extract <type>     - Extract raw data for item type
  transform <type>   - Transform extracted data to final format  
  process <type>     - Run full pipeline (extract + transform)
  process-all        - Process all configured item types
  list-types         - Show available item types
  help              - Show this help message

Available item types: ${this.availableTypes.join(', ')}

Examples:
  node extractionCLI.js extract food
  node extractionCLI.js process weapons
  node extractionCLI.js process-all
    `);
    }

    listTypes() {
        console.log('\n📋 Available Item Types:');
        console.log('========================');

        this.availableTypes.forEach(type => {
            const config = itemConfigs[type];
            console.log(`\n🔹 ${type}`);
            console.log(`   Category: ${config.category}`);
            console.log(`   Input: ${config.baseDirectory}`);
            console.log(`   Output: ${config.finalOutputFile}`);
        });
    }

    validateType(type) {
        if (!this.availableTypes.includes(type)) {
            console.error(`❌ Invalid item type: ${type}`);
            console.log(`Available types: ${this.availableTypes.join(', ')}`);
            return false;
        }
        return true;
    }

    async extract(type) {
        if (!this.validateType(type)) return;

        const config = itemConfigs[type];
        const engine = new ExtractionEngine(config);

        console.log(`\n🔍 Extracting ${type} data...`);
        return engine.extractData();
    }

    async transform(type) {
        if (!this.validateType(type)) return;

        const config = itemConfigs[type];
        const engine = new ExtractionEngine(config);

        console.log(`\n🔄 Transforming ${type} data...`);
        return engine.transformData();
    }

    async process(type) {
        if (!this.validateType(type)) return;

        const config = itemConfigs[type];
        const engine = new ExtractionEngine(config);

        console.log(`\n⚙️ Processing ${type} data...`);
        return engine.processAll();
    }

    async processAll() {
        console.log('\n🚀 Processing all item types...');
        console.log('================================');

        const results = {};

        for (const type of this.availableTypes) {
            console.log(`\n📦 Processing ${type}...`);

            try {
                const result = await this.process(type);
                results[type] = {
                    success: true,
                    count: result.length
                };
            } catch (error) {
                console.error(`❌ Failed to process ${type}:`, error.message);
                results[type] = {
                    success: false,
                    error: error.message
                };
            }
        }

        // Summary
        console.log('\n📊 Processing Summary:');
        console.log('======================');

        Object.entries(results).forEach(([type, result]) => {
            if (result.success) {
                console.log(`✅ ${type}: ${result.count} items processed`);
            } else {
                console.log(`❌ ${type}: Failed - ${result.error}`);
            }
        });

        return results;
    }

    async run() {
        const args = process.argv.slice(2);

        if (args.length === 0) {
            this.showHelp();
            return;
        }

        const [command, type] = args;

        switch (command) {
            case 'extract':
                if (!type) {
                    console.error('❌ Please specify item type for extraction');
                    return;
                }
                await this.extract(type);
                break;

            case 'transform':
                if (!type) {
                    console.error('❌ Please specify item type for transformation');
                    return;
                }
                await this.transform(type);
                break;

            case 'process':
                if (!type) {
                    console.error('❌ Please specify item type for processing');
                    return;
                }
                await this.process(type);
                break;

            case 'process-all':
                await this.processAll();
                break;

            case 'list-types':
                this.listTypes();
                break;

            case 'help':
            default:
                this.showHelp();
                break;
        }
    }
}

// Run CLI if this file is executed directly
if (require.main === module) {
    const cli = new ExtractionCLI();
    cli.run().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { ExtractionCLI };