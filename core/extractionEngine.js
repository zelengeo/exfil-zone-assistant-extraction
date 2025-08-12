const fs = require('fs');
const path = require('path');
const { applyManualOverrides } = require('../config/manualOverrides');
const { current: defaultVersion } = require('../config/mainConfig');

function extractFromDirectory(extractedItems, directory, extraction, stats) {

    // Get all JSON files in this subcategory folder
    const jsonFiles = fs.readdirSync(directory)
        .filter(file => file.endsWith('.json'));

    console.log(`Processing ${directory} with ${jsonFiles.length} items`);

    for (const jsonFile of jsonFiles) {
        const filePath = path.join(directory, jsonFile);
        const fileName = path.basename(jsonFile, '.json');

        stats.filesProcessed++;
        if (extraction.shouldSkipFile(fileName)) {
            stats.filesSkipped.push({
                file: jsonFile,
                reason: "Intentionally skipped",
                directory: directory.substring(directory.lastIndexOf('/') + 1)
            });
            continue;
        }

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
     * Template inheritance resolution for extracted items
     * @param {Array} extractedItems - Array of extracted items
     * @param {Object} stats - Statistics object to track inheritance
     * @returns {Array} - Items with resolved inheritance
     */
    resolveInheritance(extractedItems, stats) {
        // Check if inheritance is enabled for this item type
        if (!this.config.extraction.inheritableAttributes?.length) {
            return extractedItems;
        }

        console.log(`🔗 Resolving template inheritance for ${extractedItems.length} items...`);

        // Initialize inheritance statistics
        const inheritanceStats = {
            itemsWithInheritance: 0,
            fieldsInherited: {},
            inheritedFieldsCount: {},
            orphanedTemplates: [],
            templateResolutionErrors: []
        };

        // Build template lookup map - map template basenames to actual items
        const templateLookup = new Map();
        extractedItems.forEach(item => {
            const baseName = item.sourceFile.replace('.json', '');
            templateLookup.set(baseName, item);
        });

        // Process each item for inheritance
        extractedItems.forEach(item => {
            if (!item.template) return;

            // Extract template basename from full path
            // e.g., "Contractors_Showdown/Content/.../WarfareTecVest.47" -> "WarfareTecVest"
            const templatePath = item.template.split('/').pop(); // Get "WarfareTecVest.47"
            const templateBaseName = templatePath.split('.')[0]; // Get "WarfareTecVest"
            
            // Find the template item by matching basename
            const templateItem = templateLookup.get(templateBaseName);
            
            if (!templateItem) {
                // Template not found - add to orphaned templates
                if (!inheritanceStats.orphanedTemplates.includes(item.template)) {
                    inheritanceStats.orphanedTemplates.push(item.template);
                }
                return;
            }

            // Skip self-inheritance (shouldn't happen with proper template references)
            if (templateItem === item) return;

            // Track inherited fields for this item
            const inheritedFieldsForItem = [];

            // Get inheritable attributes from config
            const inheritableAttributes = this.config.extraction.inheritableAttributes;

            // Copy missing properties from template
            inheritableAttributes.forEach(field => {
                if ((item[field] === null || item[field] === undefined) && 
                    (templateItem[field] !== null && templateItem[field] !== undefined)) {
                    
                    // Deep copy for complex objects (arrays, objects)
                    if (typeof templateItem[field] === 'object' && templateItem[field] !== null) {
                        item[field] = JSON.parse(JSON.stringify(templateItem[field]));
                    } else {
                        item[field] = templateItem[field];
                    }
                    
                    inheritedFieldsForItem.push(field);
                    
                    // Track fields inherited in attribute:[items] format
                    if (!inheritanceStats.fieldsInherited[field]) {
                        inheritanceStats.fieldsInherited[field] = [];
                    }
                    const itemName = item.sourceFile ? item.sourceFile.replace('.json', '') : (item.id || item.name);
                    inheritanceStats.fieldsInherited[field].push(itemName);
                }
            });

            // Update inheritance statistics
            if (inheritedFieldsForItem.length > 0) {
                inheritanceStats.itemsWithInheritance++;
                inheritanceStats.inheritedFieldsCount[item.sourceFile || item.id || item.name] = inheritedFieldsForItem.length;
                console.log(`  ✓ ${item.sourceFile}: inherited ${inheritedFieldsForItem.join(', ')} from ${templateBaseName}`);
            }
        });

        //TODO POTENTIAL ISSUE - INHERITING FROM PARENT WHICH DIDN'T YET INHERITED VALUES ITSELF

        // Remove inherited items from missing fields lists
        Object.keys(inheritanceStats.fieldsInherited).forEach(field => {
            if (stats.missingFields[field]) {
                const inheritedItems = inheritanceStats.fieldsInherited[field];
                inheritedItems.forEach(itemName => {
                    const index = stats.missingFields[field].indexOf(itemName);
                    if (index > -1) {
                        stats.missingFields[field].splice(index, 1);
                        console.log(`  🔄 Removed ${itemName} from missing '${field}' list (inherited)`);
                    }
                });
                
                // Remove the field entirely if no items are missing it anymore
                if (stats.missingFields[field].length === 0) {
                    delete stats.missingFields[field];
                    console.log(`  ✨ Field '${field}' no longer has missing items after inheritance`);
                }
            }
        });

        // Add inheritance stats to main stats object
        stats.inheritanceStats = inheritanceStats;

        console.log(`🔗 Inheritance resolution complete: ${inheritanceStats.itemsWithInheritance} items inherited fields`);
        if (inheritanceStats.orphanedTemplates.length > 0) {
            console.log(`⚠ ${inheritanceStats.orphanedTemplates.length} orphaned templates found:`);
            inheritanceStats.orphanedTemplates.forEach(template => {
                console.log(`  - ${template}`);
            });
        }

        return extractedItems;
    }

    /**
     * Generic extraction method that works for any item type
     */
    extractData() {
        const extractedItems = [];
        const { baseDirectory, extraction, isNested } = this.config;
        
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

            // Resolve template inheritance after all items are loaded
            this.resolveInheritance(extractedItems, stats);
            
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
                    },
                    extractionStats: {
                        itemsWithMissingFields: Object.keys(stats.missingFields).length,
                        missingFieldDetails: stats.missingFields,
                        defaultsApplied: stats.defaultsApplied
                    },
                    inheritanceStats: stats.inheritanceStats || null
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
        // Initialize processing and transformation statistics
        const stats = {
            // Processing stats
            itemsProcessed: 0,
            transformationErrors: [],
            validationWarnings: [],
            
            // Transformation stats  
            fieldsOverridden: 0,
            itemsOverridden: 0,
            itemsAdded: 0,
            unusedOverrides: []
        };
        
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
            stats.itemsProcessed++;
            
            try {
                // Generate ID using configured method
                const id = transformation.generateId(itemData);
                itemData.id = id;

                // Transform to final format using configured mapper
                const transformedItem = transformation.mapToFinalFormat(itemData);

                // Validate required attributes
                if (this.validateAttributes(transformedItem, transformation.requiredAttributes, stats)) {
                    transformedItems.push(transformedItem);
                }

            } catch (error) {
                const errorMsg = `Error transforming item ${itemData.name || 'unknown'}: ${error.message}`;
                console.error(`❌ ${errorMsg}`);
                stats.transformationErrors.push({
                    item: itemData.name || itemData.id || 'unknown',
                    message: error.message
                });
            }
        });

        if (transformation.hardcodedValues) {
            transformation.hardcodedValues.forEach(item => {
                transformedItems.push(item);
            })
        }

        // Apply manual overrides
        const itemsWithOverrides = applyManualOverrides(this.config.itemType, transformedItems, stats);

        // Create versioned output with metadata
        const finalData = {
            metadata: {
                version: this.version,
                transformedAt: new Date().toISOString(),
                itemType: this.config.itemType,
                itemCount: itemsWithOverrides.length,
                gameDataPath: this.config.baseDirectory,
                processingStats: {
                    itemsProcessed: stats.itemsProcessed,
                    transformationErrors: stats.transformationErrors,
                    validationWarnings: stats.validationWarnings
                },
                transformationStats: {
                    fieldsOverridden: stats.fieldsOverridden,
                    itemsOverridden: stats.itemsOverridden,
                    itemsAdded: stats.itemsAdded,
                    unusedOverrides: stats.unusedOverrides
                }
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
    validateAttributes(item, requiredAttributes, stats = null) {
        let isValid = true;

        for (const attributePath of requiredAttributes) {
            let current = item;
            const pathParts = attributePath.split('.');

            for (const part of pathParts) {
                if (current === null || typeof current !== 'object' || !(part in current)) {
                    const warningMsg = `Missing attribute for item ID: ${item.id || 'N/A'}, missing path: ${attributePath}`;
                    console.log(`⚠ ${warningMsg}`);
                    if (stats) {
                        stats.validationWarnings.push({
                            item: item.id || 'N/A',
                            message: `Missing path: ${attributePath}`
                        });
                    }
                    isValid = false;
                    break;
                }
                current = current[part];
            }

            if (current === undefined) {
                const warningMsg = `Undefined attribute for item ID: ${item.id || 'N/A'}, attribute: ${attributePath}`;
                console.log(`⚠ ${warningMsg}`);
                if (stats) {
                    stats.validationWarnings.push({
                        item: item.id || 'N/A',
                        message: `Undefined attribute: ${attributePath}`
                    });
                }
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