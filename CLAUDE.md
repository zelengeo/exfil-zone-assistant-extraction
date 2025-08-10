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
│   ├── [item_type]_[version].json      # Final transformed data
├── extracted/                  # Output directory for extracted data
│   └── [item_type]_[version].json       # Raw extracted data
├── tools/                     # Utility scripts (to be created)
│   ├── versionCompare.js    # Compare data between versions
│   └── applyOverrides.js    # Apply manual overrides to extracted data
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

### ✅ Implemented Item Types (3/10)
- **holsters**: Tactical vest attachments
- **backpacks**: Storage containers
- **keys**: Access cards/keys

### 🔄 Pending Item Types (7/10)
- **food**: Consumables (partially configured, needs completion)
- **weapons**: Firearms and melee weapons
- **ammo**: Ammunition types
- **armor**: Body armor and helmets
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

3. **Testing Phase**
    - Test with `node extractionCLI.js extract <type>`
    - Verify extracted data structure
    - Test transformation with `node extractionCLI.js transform <type>`
    - Validate final output format

4. **Integration Phase**
    - Add any manual overrides to `config/manualOverrides.js`
    - Document special cases or edge cases
    - Update this file with implementation status

### Version Management Workflow ✅ IMPLEMENTED

Version tracking is now fully implemented with the following features:

**Configuration:**
- Version stored in `config/version.js` (update manually before extractions)
- CLI override: `--version 1.2.3` for one-off extractions

**File Structure:**
- Extracted data: `extracted/extracted_[type]_data_v1.0.0.json`
- Final data: `extracted/[type]_v1.0.0.json`
- Both include metadata with version, timestamps, counts, and game data paths

**Workflow:**
1. **Before Game Update**
    - Current versioned files serve as baseline for comparison

2. **After Game Update**
    - Update `config/version.js` to new version
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

## Development Tasks Priority

### High Priority
1. ✅ Create manual override system - COMPLETED
2. ✅ Implement version tracking system - COMPLETED
3. Complete food item extraction

### Medium Priority
1. Implement weapons extraction
2. Implement ammo extraction
3. Create version comparison tool
4. Add data validation layer

### Low Priority
1. Implement remaining item types
2. Add automated testing
3. Create data visualization tools
4. Add export formats (CSV, Excel)

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