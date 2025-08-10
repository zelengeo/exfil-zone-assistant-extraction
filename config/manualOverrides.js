const manualOverrides = {
    holsters: {
        fieldOverrides: {
            // Example: "holster_vest01": { "stats.price": 5000, "stats.rarity": "Epic" }
        },
        addItems: [
            // Additional items not found in extracted data
        ]
    },

    backpacks: {
        fieldOverrides: {
            "backpack_hypertec": { "stats.price": 200000 },
            "backpack_gnjbackpack": { "stats.price": 80000 },
            "backpack_3drt": { "stats.price": 20000 },
            "backpack_eliteops": { "stats.price": 40000 },
            "backpack_eliteops_green": { "stats.price": 40000 },
            "backpack_odldos_black": { "stats.price": 20000 },
            "backpack_odldos_flower": { "stats.price": 20000 },
            "backpack_robinson": { "stats.price": 60000 },
            "backpack_rucksack": { "stats.price": 1000 },
            "backpack_sportbag": { "stats.price": 1000 },
            "backpack_6sh118": { "stats.price": 300000 }
        },
        addItems: []
    },

    keys: {
        fieldOverrides: {
            "key_highbuilding_shop": { "stats.rarity": "Epic" },
            "key_mall_campshop": { "stats.rarity": "Legendary" },
            "key_mall_chaneo": { "stats.rarity": "Legendary" },
            "key_motel_201": { "stats.rarity": "Rare" },
            "key_motel_206": { "stats.rarity": "Rare" },
            "key_policeoffice_f2": { "stats.rarity": "Legendary" },
            "key_police_f1": { "stats.rarity": "Legendary" },
            "key_westbunker": { "stats.rarity": "Epic" },
            "key_wyethfarm": { "stats.rarity": "Rare" },
            "key_clifton_shop": { "stats.rarity": "Epic" },
            "key_dam_station_east": { "stats.rarity": "Epic" },
            "key_dam_station_west": { "stats.rarity": "Epic" },
            "key_dockhouse": { "stats.rarity": "Legendary" },
            "key_factory_a1": { "stats.rarity": "Legendary" },
            "key_factory_b": { "stats.rarity": "Legendary" },
            "key_mid_bunker": { "stats.rarity": "Epic" },
            "key_datastorage": { "stats.rarity": "Legendary" },
            "key_exitlock_f3_sewer": { "stats.rarity": "Epic" },
            "key_exitlock_trainroad": { "stats.rarity": "Epic" },
            "key_officerroom": { "stats.rarity": "Legendary" },
            "key_operatingroom": { "stats.rarity": "Epic" },
            "key_apartment": { "stats.rarity": "Epic" },
            "key_bankf2": { "stats.rarity": "Legendary" },
            "key_hospitalf2": { "stats.rarity": "Rare" },
            "key_resorthotel": { "stats.rarity": "Rare" },
            "key_tunnel": { "stats.rarity": "Legendary" },
            "key_voyages": { "stats.rarity": "Epic" }
        },
        addItems: [
            //These items are in different folders, too much hassle to change an extraction script, so I'm just going to add them here.
            {
                "id": "key_bomb",
                "name": "Bomb",
                "description": "Used to demolish the wall of the control room.",
                "category": "keys",
                "subcategory": "Metro",
                "images": {
                    "icon": "/images/items/keys/Icon_WF_Bomb.webp",
                    "thumbnail": "/images/items/keys/Icon_WF_Bomb.webp",
                    "fullsize": "/images/items/keys/Icon_WF_Bomb.webp"
                },
                "stats": {
                    "price": 1000,
                    "weight": 20,
                    "rarity": "Common"
                },
                "tips": ""
            },
            {
                "id": "key_metro_entry_ticket",
                "name": "Metro Entry Ticket",
                "description": "",
                "category": "keys",
                "subcategory": "Metro",
                "images": {
                    "icon": "/images/items/keys/Icon_Metro_Entry_Ticket.webp",
                    "thumbnail": "/images/items/keys/Icon_Metro_Entry_Ticket.webp",
                    "fullsize": "/images/items/keys/Icon_Metro_Entry_Ticket.webp"
                },
                "stats": {
                    "price": 200000,
                    "weight": 0.15,
                    "rarity": "Legendary"
                },
                "tips": ""
            }
        ]
    },

    food: {
        fieldOverrides: {
            // Example: "food_water": { "stats.price": 500 }
        },
        addItems: []
    },

    weapons: {
        fieldOverrides: {},
        addItems: []
    },

    ammo: {
        fieldOverrides: {},
        addItems: []
    },

    armor: {
        fieldOverrides: {},
        addItems: []
    },

    medical: {
        fieldOverrides: {},
        addItems: []
    },

    throwables: {
        fieldOverrides: {},
        addItems: []
    },

    attachments: {
        fieldOverrides: {},
        addItems: []
    }
};

function applyFieldOverride(item, overridePath, value) {
    const pathParts = overridePath.split('.');
    let current = item;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = value;
}

function applyManualOverrides(itemType, transformedItems, stats) {
    if (!manualOverrides[itemType]) {
        return transformedItems;
    }
    
    const { fieldOverrides, addItems } = manualOverrides[itemType];
    
    // Create a set of existing item IDs for quick lookup
    const existingItemIds = new Set(transformedItems.map(item => item.id));
    
    // Track override usage
    const usedOverrides = new Set();
    
    // Apply field overrides to existing items
    const modifiedItems = transformedItems.map(item => {
        if (fieldOverrides[item.id]) {
            usedOverrides.add(item.id);
            const overrides = fieldOverrides[item.id];
            const modifiedItem = JSON.parse(JSON.stringify(item)); // Deep copy
            
            // Track stats
            stats.itemsOverridden++;
            stats.fieldsOverridden += Object.keys(overrides).length;
            
            Object.entries(overrides).forEach(([path, value]) => {
                applyFieldOverride(modifiedItem, path, value);
            });
            
            return modifiedItem;
        }
        return item;
    });
    
    // Find unused overrides and track them
    Object.keys(fieldOverrides).forEach(itemId => {
        if (!existingItemIds.has(itemId)) {
            stats.unusedOverrides.push(itemId);
        }
    });
    
    // Track added items
    stats.itemsAdded = addItems.length;
    
    // Add additional items
    return [...modifiedItems, ...addItems];
}

module.exports = {
    manualOverrides,
    applyManualOverrides,
    applyFieldOverride
};