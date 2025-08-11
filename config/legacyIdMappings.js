/**
 * Legacy ID mappings for items that were originally created with AI-generated IDs
 * Maps source filename (without extension) to the desired legacy ID
 * 
 * This allows maintaining compatibility with existing data while using
 * systematic ID generation for new items.
 */

const legacyIdMappings = {
    // Armor mappings - filename to legacy ID
    armor: {
        'WarfareTecVest_SDprotecter': 'armor-sd-protector',
        'WarfareTecVest_SDprotecter_Black': 'armor-sd-protector-black',
        'WarfareTecVest_6B17': 'armor-6b17',
        'WarfareTecVest_6B17rig': 'armor-6b17-upgrade',
        'WarfareTecVest_ApexBK': 'armor-apex-bk',
        'WarfareTecVest_ApexMC': 'armor-apex-mc',
        'WarfareTecVest_DuoMoutains': 'armor-duo-mountains',
        'WarfareTecVest_IMTV': 'armor-imtv',
        'WarfareTecVest_IOTVGEN3': 'armor-iotvgen3',
        'WarfareTecVest_JPC': 'armor-jpc',
        'WarfareTecVest_Police': 'armor-police-vest',
        'WarfareTecVest_Press': 'armor-press-vest',
        'WarfareTecVest_RaidExplorer_Black': 'armor-raid-explorer-black',
        'WarfareTecVest_RaidExplorer_SD': 'armor-raid-explorer-sd',
        'WarfareTecVest_Rampage': 'armor-rampage',
        'WarfareTecVest_Rampage_bells': 'armor-rampage-bells',
        'WarfareTecVest_Rampage_OD': 'armor-rampage-od',
        'WarfareTecVest_Rampage_skull': 'armor-rampage-skull',
        'WarfareTecVest_Security': 'armor-security-vest',
        'WarfareTecVest_SoftArmor': 'armor-soft-armor',
        'WarfareTecVest_SuddenAttack': 'armor-sudden-attack',
        'WarfareTecVest_WDCS': 'armor-wdcs',
        'WarfareTecVest_WDCS_Swat': 'armor-wdcs-swat',
    },
    
    // Helmet mappings (for future use)
    helmets: {
        // Add helmet mappings here
    },
    
    // Weapon mappings (for future use)  
    weapons: {
        // Add weapon mappings here
    },
    
    // Ammo mappings (for future use)
    ammo: {
        // Add ammo mappings here
    },
    
    // Magazine mappings (for future use)
    magazines: {
        // Add magazine mappings here
    }
};

/**
 * Helper function to get legacy ID for an item type and filename
 * @param {string} itemType - The item type (armor, helmets, weapons, etc.)
 * @param {string} sourceFile - The source filename (with or without .json extension)
 * @returns {string|null} - The legacy ID if found, null otherwise
 */
function getLegacyId(itemType, sourceFile) {
    const filename = sourceFile.replace('.json', '');
    const mappings = legacyIdMappings[itemType];
    return mappings ? mappings[filename] || null : null;
}

module.exports = {
    legacyIdMappings,
    getLegacyId
};