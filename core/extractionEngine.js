const fs = require('fs');
const path = require('path');
const { applyManualOverrides } = require('../config/manualOverrides');
const { current: defaultVersion } = require('../config/version');

function extractFromDirectory(extractedItems, directory, extraction, stats) {

    // Get all JSON files in this subcategory folder
    const jsonFiles = fs.readdirSync(directory)
        .filter(file => file.endsWith('.json'));

    console.log(`Processing ${directory} with ${jsonFiles.length} items`);

    for (const jsonFile of jsonFiles) {
        const filePath = path.join(directory, jsonFile);
        const fileName = path.basename(jsonFile, '.json');

        stats.filesProcessed++;

        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);

            // Use the configured element finder
            const element = extraction.findElement(data, fileName);

            if (element && element.Properties) {
                // Use the configured data extractor with stats tracking
                const itemData = extraction.extractData(element, data, fileName, directory, stats);

                if (itemData) {
                    extractedItems.push(itemData);
                    console.log(`✓ Extracted: ${fileName} (${directory})`);
                } else {
                    console.log(`✓ Filtered out: ${fileName} (${directory})`);
                    stats.filesSkipped.push({
                        file: jsonFile,
                        reason: "Filtered by extraction logic",
                        directory: directory.substring(directory.lastIndexOf('/') + 1)
                    });
                }

            } else {
                const warningMsg = `No matching element found in ${jsonFile} for type starting with "${fileName}"`;
                console.log(`⚠ ${warningMsg}`);
                stats.warnings.push({
                    file: jsonFile,
                    message: warningMsg,
                    directory: directory.substring(directory.lastIndexOf('/') + 1)
                });
                stats.filesSkipped.push({
                    file: jsonFile,
                    reason: "No matching element found",
                    directory: directory.substring(directory.lastIndexOf('/') + 1)
                });
            }

        } catch (error) {
            const errorMsg = `Error processing ${jsonFile}: ${error.message}`;
            console.error(`❌ ${errorMsg}`);
            stats.errors.push({
                file: jsonFile,
                message: error.message,
                directory: directory.substring(directory.lastIndexOf('/') + 1)
            });
        }
    }
}

class ExtractionEngine {
    constructor(config, version = null) {
        this.config = config;
        this.version = version || defaultVersion;
    }

    /**
     * Generic extraction method that works for any item type
     */
    extractData() {
        const extractedItems = [];
        const { baseDirectory, extraction, isNested } = this.config;
        const startTime = Date.now();
        
        // Initialize processing statistics
        const stats = {
            filesProcessed: 0,
            filesSkipped: [],
            errors: [],
            warnings: [],
            missingFields: {},
            defaultsApplied: {}
        };

        try {
            if (isNested) {
                // Get all subcategory folders (e.g., caliber folders, food type folders)
                const subcategoryFolders = fs.readdirSync(baseDirectory, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

                console.log(`Found ${subcategoryFolders.length} ${this.config.category} subcategories:`, subcategoryFolders);

                for (const subcategory of subcategoryFolders) {
                    const subcategoryPath = path.join(baseDirectory, subcategory);
                    extractFromDirectory(extractedItems, subcategoryPath, extraction, stats);
                }
            } else {
                // Extract from Jsons in the current dir
                extractFromDirectory(extractedItems, baseDirectory, extraction, stats)
            }

            // Calculate processing time
            const processingTime = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
            
            // Create versioned output with metadata
            const versionedData = {
                metadata: {
                    version: this.version,
                    extractedAt: new Date().toISOString(),
                    itemType: this.config.itemType,
                    itemCount: extractedItems.length,
                    gameDataPath: this.config.baseDirectory,
                    processingStats: {
                        filesProcessed: stats.filesProcessed,
                        filesSkipped: stats.filesSkipped,
                        extractionErrors: stats.errors,
                        validationWarnings: stats.warnings,
                        processingTime: processingTime
                    },
                    extractionStats: {
                        itemsWithMissingFields: Object.keys(stats.missingFields).length,
                        missingFieldDetails: stats.missingFields,
                        defaultsApplied: stats.defaultsApplied
                    }
                },
                items: extractedItems
            };

            // Save the extracted data with versioned filename
            const baseFileName = this.config.outputFile;
            const versionedFileName = `${baseFileName}_v${this.version}.json`;
            const outputPath = path.join('./extracted', versionedFileName);
            
            fs.writeFileSync(outputPath, JSON.stringify(versionedData, null, 2));
            console.log(`\n🎯 Extraction complete! Found ${extractedItems.length} ${this.config.itemType} items`);
            console.log(`📁 Data saved to: ${outputPath}`);

            return extractedItems;

        } catch (error) {
            console.error('❌ Fatal error:', error.message);
            return [];
        }
    }

    /**
     * Transform extracted data into final format
     */
    transformData(extractedData = null) {
        // Load extracted data if not provided
        if (!extractedData) {
            try {
                // Try to load versioned extraction file first
                const baseFileName = this.config.outputFile;
                const versionedFileName = `${baseFileName}_v${this.version}.json`;
                const extractedPath = path.join('./extracted', versionedFileName);
                
                const fileContent = fs.readFileSync(extractedPath, 'utf8');
                const versionedData = JSON.parse(fileContent);
                
                // Extract the items array from versioned format
                extractedData = versionedData.items || versionedData;
            } catch (error) {
                console.error(`❌ Error loading extracted data: ${error.message}`);
                return [];
            }
        }

        const { transformation } = this.config;
        const transformedItems = [];

        console.log(`🔄 Starting ${this.config.category} data transformation...`);

        extractedData.forEach(itemData => {
            try {
                // Generate ID using configured method
                const id = transformation.generateId(itemData);
                itemData.id = id;

                // Transform to final format using configured mapper
                const transformedItem = transformation.mapToFinalFormat(itemData);

                // Validate required attributes
                if (this.validateAttributes(transformedItem, transformation.requiredAttributes)) {
                    transformedItems.push(transformedItem);
                }

            } catch (error) {
                console.error(`❌ Error transforming item ${itemData.name || 'unknown'}:`, error.message);
            }
        });

        if (transformation.hardcodedValues) {
            transformation.hardcodedValues.forEach(item => {
                transformedItems.push(item);
            })
        }

        // Apply manual overrides
        const itemsWithOverrides = applyManualOverrides(this.config.itemType, transformedItems);

        // Create versioned output with metadata
        const finalData = {
            metadata: {
                version: this.version,
                transformedAt: new Date().toISOString(),
                itemType: this.config.itemType,
                itemCount: itemsWithOverrides.length,
                gameDataPath: this.config.baseDirectory,
                manualOverrides: itemsWithOverrides.length - transformedItems.length + 
                    transformedItems.filter((item, index) => 
                        JSON.stringify(item) !== JSON.stringify(itemsWithOverrides[index] || {})
                    ).length
            },
            items: itemsWithOverrides
        };

        // Save transformed data with versioned filename
        const baseFinalFileName = this.config.finalOutputFile;
        const versionedFinalFileName = `${baseFinalFileName}_v${this.version}.json`;
        const outputPath = path.join('./transformed/', versionedFinalFileName);
        
        fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

        console.log(`✅ Successfully transformed ${itemsWithOverrides.length} ${this.config.itemType} items`);
        console.log(`📁 Output saved to: ${outputPath}`);

        return itemsWithOverrides;
    }

    /**
     * Validate that all required attributes are present
     */
    validateAttributes(item, requiredAttributes) {
        let isValid = true;

        for (const attributePath of requiredAttributes) {
            let current = item;
            const pathParts = attributePath.split('.');

            for (const part of pathParts) {
                if (current === null || typeof current !== 'object' || !(part in current)) {
                    console.log(`Missing attribute for item ID: ${item.id || 'N/A'}, missing path: ${attributePath}`);
                    isValid = false;
                    break;
                }
                current = current[part];
            }

            if (current === undefined) {
                console.log(`Undefined attribute for item ID: ${item.id || 'N/A'}, attribute: ${attributePath}`);
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Run both extraction and transformation
     */
    processAll() {
        console.log(`\n🚀 Starting full processing pipeline for ${this.config.category}...`);

        const extractedData = this.extractData();
        if (extractedData.length === 0) {
            console.log(`❌ No data extracted for ${this.config.category}, skipping transformation`);
            return [];
        }

        const transformedData = this.transformData(extractedData);

        console.log(`\n🎉 Processing complete for ${this.config.category}!`);
        return transformedData;
    }
}

module.exports = { ExtractionEngine };