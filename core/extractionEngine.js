const fs = require('fs');
const path = require('path');

function extractFromDirectory(extractedItems, directory, extraction) {

    // Get all JSON files in this subcategory folder
    const jsonFiles = fs.readdirSync(directory)
        .filter(file => file.endsWith('.json'));

    console.log(`Processing ${directory} with ${jsonFiles.length} items`);

    for (const jsonFile of jsonFiles) {
        const filePath = path.join(directory, jsonFile);
        const fileName = path.basename(jsonFile, '.json');

        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);

            // Use the configured element finder
            const element = extraction.findElement(data, fileName);

            if (element && element.Properties) {
                // Use the configured data extractor
                const itemData = extraction.extractData(element, data ,fileName, directory);

                if (itemData) {
                    extractedItems.push(itemData);
                    console.log(`✓ Extracted: ${fileName} (${directory})`);
                } else {
                    console.log(`✓ Filtered out: ${fileName} (${directory})`);
                }


            } else {
                console.log(`⚠ No matching element found in ${jsonFile} for type starting with "${fileName}"`);
            }

        } catch (error) {
            console.error(`❌ Error processing ${jsonFile}:`, error.message);
        }
    }
}

class ExtractionEngine {
    constructor(config) {
        this.config = config;
    }

    /**
     * Generic extraction method that works for any item type
     */
    extractData() {
        const extractedItems = [];
        const { baseDirectory, extraction, isNested } = this.config;

        try {
            if (isNested) {
                // Get all subcategory folders (e.g., caliber folders, food type folders)
                const subcategoryFolders = fs.readdirSync(baseDirectory, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

                console.log(`Found ${subcategoryFolders.length} ${this.config.category} subcategories:`, subcategoryFolders);

                for (const subcategory of subcategoryFolders) {
                    const subcategoryPath = path.join(baseDirectory, subcategory);
                    extractFromDirectory(extractedItems, subcategoryPath, extraction);
                }
            } else {
                // Extract from Jsons in the current dir
                extractFromDirectory(extractedItems, baseDirectory, extraction)
            }

            // Save the extracted data
            const outputPath = path.join('./extracted', this.config.outputFile);
            fs.writeFileSync(outputPath, JSON.stringify(extractedItems, null, 2));
            console.log(`\n🎯 Extraction complete! Found ${extractedItems.length} ${this.config.category} items`);
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
                const extractedPath = path.join('./extracted/', this.config.outputFile);
                const fileContent = fs.readFileSync(extractedPath, 'utf8');
                extractedData = JSON.parse(fileContent);
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

        // Save transformed data
        const outputPath = path.join('./extracted/', this.config.finalOutputFile);
        fs.writeFileSync(outputPath, JSON.stringify(transformedItems, null, 2));

        console.log(`✅ Successfully transformed ${transformedItems.length} ${this.config.category} items`);
        console.log(`📁 Output saved to: ${outputPath}`);

        return transformedItems;
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