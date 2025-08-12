# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the game data extraction tool for Contractors Showdown.

## Project Overview

A configuration-driven extraction and transformation pipeline for game asset data from Contractors Showdown. The tool extracts item data from JSON files, transforms it into a standardized format for a web application, and maintains version tracking with manual override capabilities.

## Core Principles

1. **Configuration-Driven**: All extraction logic should be defined in `config/itemConfigs.js`, not hardcoded in the engine
2. **Version Tracking**: Changes between game versions must be tracked and compared
3. **Manual Override Preservation**: Manual fixes/additions must persist across extractions
4. **Separation of Concerns**: Keep extraction logic, transformation logic, and manual overrides separate
5. **Incremental Development**: Add new item types one at a time with proper testing

### Data Flow

1. **Extraction Phase**: Reads JSON files from configured directories, finds relevant elements, extracts raw data
2. **Transformation Phase**: Takes extracted data, generates IDs, maps to final standardized format, validates attributes
3. **Output**: Saves both extracted and transformed data to `extracted/` directory

## Project Structure

```
/
├── config/
│   ├── itemConfigs.js         # Item type configurations
│   ├── stringTable.js         # Localized display names
│   └── manualOverrides.js     # Manual data fixes/additions (to be created)
├── core/
│   └── extractionEngine.js    # Core extraction/transformation engine
├── transformed/                 # Output directory for transformed data
│   └── [item_type]_[version].json      # Final transformed data
├── extracted/                  # Output directory for extracted data
│   └── [item_type]_[version].json       # Raw extracted data
├── tools/                     # Utility scripts (to be created)
│   └── versionCompare.js    # Compare data between versions
├── .claudeignore             # Files/folders to ignore (to be created)
└── extractionCLI.js          # Command-line interface

```

## Files to Ignore

When working on this project, ignore these files/directories (add to `.claudeignore`):
- `extracted/` - Contains extracted data
- `transformed/` - Contains generated output data
- `node_modules/` - Dependencies
- `*.log` - Log files
- Raw game data directories (paths starting with `D:/`)

## Current Implementation Status

### ✅ Implemented Item Types (4/10)
- **holsters**: Tactical vest attachments
- **backpacks**: Storage containers
- **keys**: Access cards/keys
- **armor**: Body armor and helmets (with template inheritance)

### 🔄 Pending Item Types (6/10)
- **food**: Consumables (partially configured, needs completion)
- **weapons**: Firearms and melee weapons
- **ammo**: Ammunition types
- **medical**: Medical supplies
- **throwables**: Grenades and throwables
- **attachments**: Weapon attachments

## Workflow Guidelines

### Adding New Item Types

1. **Research Phase**
    - Analyze game JSON structure for the item type
    - Identify unique properties and relationships
    - Document findings in comments

2. **Configuration Phase**
    - Add configuration to `itemConfigs.js`
    - Set the `itemType` field to match the key used in `config/manualOverrides.js`
    - Define extraction logic (`findElement`, `extractData`)
    - Define transformation logic (`generateId`, `mapToFinalFormat`)
    - Specify required attributes and validation rules
    - Configure `inheritableAttributes` if items use template inheritance

3. **Testing Phase**
    - Test with `node extractionCLI.js extract <type>`
    - Verify extracted data structure
    - Test transformation with `node extractionCLI.js transform <type>`
    - Validate final output format

4. **Integration Phase**
    - Add any manual overrides to `config/manualOverrides.js`
    - Review extraction metadata for missing fields and processing issues
    - Review transformation metadata for unused overrides
    - Document special cases or edge cases
    - Update this file with implementation status

### Version Management Workflow ✅ IMPLEMENTED

Version tracking is now fully implemented with the following features:

**Configuration:**
- Version stored in `config/mainConfig.js` (update manually before extractions)
- CLI override: `--version 1.2.3` for one-off extractions

**File Structure:**
- Extracted data: `extracted/extracted_[type]_data_v1.0.0.json`
- Final data: `extracted/[type]_v1.0.0.json`
- Both include metadata with version, timestamps, counts, and game data paths

**Workflow:**
1. **Before Game Update**
    - Current versioned files serve as baseline for comparison

2. **After Game Update**
    - Update `config/mainConfig.js` to new version
    - Run extraction pipeline: `node extractionCLI.js process-all`
    - Compare new versioned files with previous versions
    - Update manual overrides in `config/manualOverrides.js` as needed

**Commands:**
```bash
# Use default version from config
node extractionCLI.js process backpacks

# Override version for testing
node extractionCLI.js process backpacks --version 1.2.3-beta

# Process all types with current version
node extractionCLI.js process-all
```

### Manual Override System ✅ IMPLEMENTED

The manual override system is implemented in `config/manualOverrides.js` and provides:
- Persistent overrides across extractions
- Version-controlled override data
- Field-level overrides using dot notation (e.g., `"stats.price": 5000`)
- Complete item additions via `addItems` array

**Structure:**
```javascript
const manualOverrides = {
  itemTypeName: {
    fieldOverrides: {
      "item_id": { 
        "stats.price": 5000,          // Override nested field
        "description": "New desc"     // Override top-level field
      }
    },
    addItems: [
      // Complete item objects that aren't found in extracted data
      { id: "special_item", name: "Special Item", ... }
    ]
  }
}
```

**Usage:** Overrides are automatically applied during transformation phase. The `itemType` field in `itemConfigs.js` must match the key used in `manualOverrides`.

### Enhanced Metadata System ✅ IMPLEMENTED

Both extraction and transformation phases now include comprehensive metadata for tracking data quality and processing statistics.

**Extraction Metadata:**
```json
{
  "metadata": {
    "version": "1.1.0-enhanced",
    "extractedAt": "2025-08-10T13:21:41.573Z",
    "itemType": "backpacks",
    "itemCount": 11,
    "gameDataPath": "D:/path/to/game/data",
    "processingStats": {
      "filesProcessed": 26,
      "filesSkipped": [{"file": "file.json", "reason": "No matching element", "directory": "Backpack"}],
      "extractionErrors": [{"file": "file.json", "message": "Error details", "directory": "Backpack"}],
      "validationWarnings": [...]
    },
    "extractionStats": {
      "itemsWithMissingFields": 3,
      "missingFieldDetails": {
        "weight": ["item1", "item2"],
        "rarity": ["item3"]
      },
      "defaultsApplied": {
        "weight": ["item1", "item2"]
      }
    }
  }
}
```

**Transformation Metadata:**
```json
{
  "metadata": {
    "processingStats": {
      "itemsProcessed": 11,
      "transformationErrors": [],
      "validationWarnings": []
    },
    "transformationStats": {
      "fieldsOverridden": 11,
      "itemsOverridden": 11,
      "itemsAdded": 0,
      "unusedOverrides": ["item_that_doesnt_exist"]
    }
  }
}
```

**Key Benefits:**
- **Missing Field Tracking**: Detect when game data structure changes
- **Default Application Tracking**: Know exactly which items use fallback values
- **Processing Diagnostics**: Detailed error and warning tracking
- **Override Usage Analysis**: Identify unused manual overrides
- **Version Comparison Ready**: Rich metadata for comparing game updates

**Usage Examples:**
```bash
# Check extraction metadata for data quality issues
node extractionCLI.js extract backpacks --version game-v1.2.3
# Review missingFieldDetails and defaultsApplied sections

# Check transformation metadata for override efficiency
node extractionCLI.js transform backpacks --version game-v1.2.3
# Review unusedOverrides to clean up manualOverrides.js

# Full pipeline with comprehensive metadata
node extractionCLI.js process backpacks --version game-v1.2.3
```

### Template Inheritance System ✅ IMPLEMENTED

The template inheritance system automatically resolves missing data by inheriting values from parent templates, crucial for game items that use template-based architecture.

**How It Works:**
- Items reference template files via `template` field in their JSON data
- Missing or null fields are automatically filled from the referenced template
- Inheritance occurs during extraction phase, before transformation
- Only fields defined in `inheritableAttributes` config are inherited
- Deep copying ensures complex objects (arrays, nested objects) are properly inherited

**Configuration:**
```javascript
// In itemConfigs.js
armor: {
  extraction: {
    inheritableAttributes: [
      'rarity', 'weight', 'maxDurability', 'durabilityDamageScalar',
      'antiPenetrationDisplay', 'bluntDamageScalarDisplay', 'protectiveData',
      'penetrationChanceCurve', 'penetrationDamageScalarCurve',
      'antiPenetrationDurabilityScalarCurve'
    ],
    // ... other extraction config
  }
}
```

**Inheritance Metadata:**
```json
{
  "inheritanceStats": {
    "itemsWithInheritance": 8,
    "fieldsInherited": {
      "maxDurability": ["WarfareTecVest_Heavy", "WarfareTecVest_Light"],
      "protectiveData": ["WarfareTecVest_Basic"]
    },
    "inheritedFieldsCount": {
      "WarfareTecVest_Heavy": 3,
      "WarfareTecVest_Light": 2
    },
    "orphanedTemplates": ["/Game/Templates/MissingTemplate"],
    "templateResolutionErrors": []
  }
}
```

**Key Features:**
- **Missing Field Resolution**: Inherited fields are removed from `missingFields` tracking
- **Template Validation**: Tracks orphaned templates (referenced but not found)
- **Inheritance Tracking**: Detailed statistics on what was inherited from where
- **Self-Inheritance Prevention**: Prevents items from inheriting from themselves
- **Deep Copy Support**: Safely copies complex nested data structures

**Benefits:**
- **Reduced Manual Overrides**: Less need for manual data fixes when templates provide values
- **Data Completeness**: Automatic resolution of missing fields where templates exist
- **Template Dependency Tracking**: Visibility into template relationships and missing dependencies
- **Quality Assurance**: Clear reporting on inheritance success and failure cases

## Development Tasks Priority

### High Priority
1. ✅ Create manual override system - COMPLETED
2. ✅ Implement version tracking system - COMPLETED
3. ✅ Enhanced metadata system (missing fields, processing stats) - COMPLETED
4. ✅ Implement armor extraction with template inheritance - COMPLETED

### Medium Priority
1. Implement remaining extraction
2. Create version comparison tool
3. Add data validation layer

### Low Priority
1. Add automated testing
2. Create data visualization tools
3. Add export formats (CSV, Excel)

## Code Standards

### When modifying extraction logic:
- Keep all configuration in `itemConfigs.js`
- Don't hardcode values in transformation functions - use `config/manualOverrides.js` instead
- Set the `itemType` field to match the override key
- Use descriptive variable names for clarity
- Add comments for complex transformations
- Validate data at both extraction and transformation stages

### When adding new features:
- Follow existing patterns in the codebase
- Update CLI help text and documentation
- Add error handling and user-friendly messages
- Test with edge cases and malformed data

### When fixing bugs:
- First check if it's a configuration issue
- Document the fix in comments
- Add to manual overrides if it's data-specific
- Update tests to prevent regression

## Common Patterns

### ID Generation
IDs should be:
- Unique across all items of that type
- Lowercase with underscores
- Prefixed with item type (e.g., `holster_`, `weapon_`)
- Derived from stable properties when possible

### Data Transformation
- Map game-specific enums to human-readable values
- Standardize image paths
- Apply default values for missing data
- Validate against required attributes

### Error Handling
- Log warnings for missing optional data
- Throw errors for missing required data
- Provide context about which file/item failed
- Continue processing other items on failure

## Testing Commands

```bash
# Test single item type extraction
node extractionCLI.js extract holsters

# Test transformation
node extractionCLI.js transform holsters

# Full pipeline for one type
node extractionCLI.js process holsters

# Process all configured types
node extractionCLI.js process-all

# List available types
node extractionCLI.js list-types
```

## Important Notes

1. **Game Data Paths**: The base game data directory is currently hardcoded. This should be made configurable via environment variables or config file.

2. **String Table**: The `stringTable.js` contains localized names. Always check this for display names before using raw game strings.

3. **Rarity Mapping**: Use the existing `rarityMap` for converting game quality enums to readable rarity names.

4. **Nested vs Flat Structure**: Some item types have nested folder structures (e.g., ammo by caliber). The `isNested` flag in config handles this.

5. **Template Defaults**: Many items inherit default values from their template. When a property is missing, check if there's a template default before marking it as invalid.

## Questions to Ask When Implementing

Before starting any task, clarify:
1. Which item type are we working on?
2. Are there manual overrides to preserve?
3. What's the target game version?
4. Should we update or replace existing extraction logic?
5. Are there new data fields in the latest game version?

## Error Recovery

If extraction fails:
1. Check source data path exists
2. Verify JSON file structure hasn't changed
3. Review error logs for specific items
4. Check if manual overrides are needed
5. Validate against required attributes

Remember: The goal is maintainable, version-tracked extraction that preserves manual improvements while adapting to game updates.