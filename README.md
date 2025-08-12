# Contractors Showdown - Data Extraction Tool

A configuration-driven extraction and transformation pipeline for game asset data from Contractors Showdown. This tool extracts item data from JSON files, transforms it into a standardized format for web applications, and maintains version tracking with manual override capabilities.

## 🚀 Features

- **Configuration-Driven**: All extraction logic defined in config files, not hardcoded
- **Version Tracking**: Track changes between game versions with comprehensive metadata
- **Template Inheritance**: Automatic resolution of missing data from parent templates
- **Manual Overrides**: Persistent manual fixes and additions across extractions
- **Enhanced Metadata**: Detailed processing statistics and data quality tracking
- **Multiple Item Types**: Support for holsters, backpacks, keys, armor, and more

## 📋 Current Implementation Status

### ✅ Implemented (4/10)
- **holsters**: Tactical vest attachments
- **backpacks**: Storage containers  
- **keys**: Access cards/keys
- **armor**: Body armor and helmets (with template inheritance)

### 🔄 In Progress (6/10)
- **food**: Consumables (partially configured)
- **weapons**: Firearms and melee weapons
- **ammo**: Ammunition types
- **medical**: Medical supplies
- **throwables**: Grenades and throwables
- **attachments**: Weapon attachments

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exfil-zone-assistant-extraction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure game data path**
   - Update `config/mainConfig.js` with your exported game data path
   - Set the appropriate version number

## 📖 Usage

### Basic Commands

```bash
# Extract data for a specific item type
node extractionCLI.js extract armor

# Transform extracted data to final format
node extractionCLI.js transform armor

# Complete pipeline (extract + transform)
node extractionCLI.js process armor

# Process all configured item types
node extractionCLI.js process-all

# List available item types
node extractionCLI.js list-types
```

### Version Management

```bash
# Use default version from config
node extractionCLI.js process armor

# Override version for testing
node extractionCLI.js process armor --version 1.3.14.0-test

# Process all types with specific version
node extractionCLI.js process-all --version 1.3.14.0
```

## 🏗️ Project Structure

```
├── config/
│   ├── itemConfigs.js         # Item type configurations
│   ├── mainConfig.js         # Main configuration (version, paths)
│   ├── stringTable.js        # Localized display names
│   └── manualOverrides.js    # Manual data fixes/additions
├── core/
│   └── extractionEngine.js   # Core extraction/transformation engine
├── extracted/                # Output directory for all data
│   ├── extracted_[type]_data_v[version].json  # Raw extracted data
│   └── [type]_v[version].json                 # Final transformed data
├── tools/                    # Utility scripts
└── extractionCLI.js         # Command-line interface
```

## ⚙️ Configuration

### Adding New Item Types

1. **Research the game data structure**
   - Analyze JSON files for the item type
   - Identify unique properties and relationships

2. **Configure in `config/itemConfigs.js`**
   ```javascript
   newItemType: {
     baseDirectory: configBase.baseDirectory + '/ItemFolder',
     outputFile: 'item_data',
     finalOutputFile: 'items',
     category: 'category',
     itemType: 'newItemType',
     
     extraction: {
       findElement: (jsonData) => {
         // Logic to find relevant element in JSON
       },
       extractData: (properties, fileName, stats) => {
         // Logic to extract data from properties
       },
       inheritableAttributes: ['field1', 'field2'] // Optional
     },
     
     transformation: {
       generateId: (itemData) => {
         // Logic to generate unique ID
       },
       mapToFinalFormat: (itemData) => {
         // Logic to map to final format
       },
       requiredAttributes: ['id', 'name', ...]
     }
   }
   ```

3. **Test the configuration**
   ```bash
   node extractionCLI.js extract newItemType
   node extractionCLI.js transform newItemType
   ```

### Manual Overrides

Add persistent data fixes in `config/manualOverrides.js`:

```javascript
const manualOverrides = {
  armor: {
    fieldOverrides: {
      "item_id": {
        "stats.price": 50000,
        "description": "Updated description"
      }
    },
    addItems: [
      // Complete item objects not found in extracted data
      { id: "special_armor", name: "Special Armor", ... }
    ]
  }
}
```

## 🔄 Template Inheritance

The system automatically resolves missing data by inheriting from parent templates:

- Items reference templates via `template` field in JSON data
- Missing fields are filled from referenced templates
- Only fields in `inheritableAttributes` config are inherited
- Inheritance statistics are tracked in metadata

**Example inheritance metadata:**
```json
{
  "inheritanceStats": {
    "itemsWithInheritance": 8,
    "fieldsInherited": {
      "maxDurability": ["WarfareTecVest_Heavy", "WarfareTecVest_Light"]
    },
    "orphanedTemplates": []
  }
}
```

## 📊 Metadata & Tracking

### Extraction Metadata
- Files processed, skipped, and errored
- Missing field tracking by item
- Applied defaults
- Inheritance statistics

### Transformation Metadata  
- Override usage statistics
- Unused overrides detection
- Processing errors and warnings

### Version Comparison
All output files include version information for easy comparison between game updates.

## 🔧 Troubleshooting

### Common Issues

1. **"No matching element found"**
   - Check `findElement` logic in config
   - Verify game data directory path
   - Ensure JSON structure hasn't changed

2. **Missing required attributes**
   - Review `requiredAttributes` in config
   - Check if manual overrides are needed
   - Verify template inheritance is working

3. **Orphaned templates**
   - Review inheritance statistics in metadata
   - Check if template files exist in extracted data
   - Update `inheritableAttributes` if needed

### Debugging

```bash
# Check extraction metadata for issues
node extractionCLI.js extract armor
# Review the extracted JSON file's metadata section

# Check transformation metadata 
node extractionCLI.js transform armor
# Review unusedOverrides and processing stats
```

## 🤝 Contributing

1. **Follow existing patterns**
   - Use configuration-driven approach
   - Add comprehensive error handling
   - Include proper documentation

2. **Testing**
   - Test extraction and transformation separately
   - Verify with edge cases and malformed data
   - Check metadata for quality indicators

3. **Documentation**
   - Update CLAUDE.md with implementation details
   - Document any special cases or edge cases
   - Update this README if adding major features

## 📝 License

This project is intended for game data extraction and analysis purposes.

## 🔗 Related Files

- **CLAUDE.md**: Detailed development guidelines and technical documentation
- **config/itemConfigs.js**: Item type configurations and extraction logic
- **config/manualOverrides.js**: Manual data fixes and additions

---

For detailed development guidelines and technical implementation details, see [CLAUDE.md](./CLAUDE.md).