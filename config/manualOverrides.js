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
        fieldOverrides: {
            "armor-6b17": {
                "description": "Russian military body armor vest providing Class 4 protection with ceramic plates. Good budget choice",
                "notes": "Military-grade protection with ceramic trauma plates. Effective against most rifle calibers.",
                "tips": "Balance the excellent protection against the mobility penalty. Best used when expecting heavy combat or holding defensive positions.",
                "stats.price": 29485
            },
            "armor-6b17-upgrade": {
                "description": "Russian military body armor vest providing Class 5 protection with ceramic plates. Offers excellent protection against rifle rounds while maintaining reasonable mobility.",
                "notes": "Military-grade protection with ceramic trauma plates. Effective against most rifle calibers.",
                "tips": "The only AC5 armor at LVL3 trader. You will get used to it",
                "stats.price": 53225
            },
            "armor-apex-bk": {
                "description": "High-end tactical body armor featuring advanced ceramic plates and improved ergonomics. Provides Class 5 protection with reduced weight penalty.",
                "notes": "Advanced tactical armor with improved protection and durability.",
                "tips": "Excellent choice for high-threat environments where maximum protection is needed.",
                "stats.price": 77284
            },
            "armor-sudden-attack": {
                "description": "Lightweight tactical vest designed for rapid deployment operations. Provides basic protection while maintaining high mobility.",
                "notes": "Entry-level armor effective against pistol rounds and light rifle fire.",
                "tips": "Good starting armor for new operators or stealth missions where mobility is critical.",
                "stats.price": 35000
            },
            "armor-apex-mc": {
                "description": "Premium tactical body armor with multicam pattern. Features advanced materials for superior protection with optimized weight distribution.",
                "notes": "High-performance armor with excellent protection-to-weight ratio.",
                "tips": "Premium choice for experienced operators who need reliable protection without excessive bulk.",
                "stats.price": 77284
            },
            "armor-duo-mountains": {
                "description": "Rugged tactical vest designed for mountainous terrain operations. Balances protection with environmental adaptability.",
                "notes": "Reliable protection with enhanced durability for extended operations.",
                "tips": "Excellent choice for long missions where equipment reliability is paramount.",
                "stats.price": 41546
            },
            "armor-imtv": {
                "description": "Improved Modular Tactical Vest providing comprehensive protection. Features modular design for mission-specific configurations.",
                "notes": "Modular tactical vest with excellent protection and customization options.",
                "tips": "Heavy but reliable armor for sustained combat operations.",
                "stats.price": 78830
            },
            "armor-iotvgen3": {
                "description": "Improved Outer Tactical Vest Generation 3 with full body protection including arm and pelvis coverage. Maximum protection for high-threat environments.",
                "notes": "Military-grade full body protection including arm guards and pelvis protection.",
                "tips": "Ultimate protection for extreme combat situations. The weight penalty is significant but the protection is unmatched.",
                "stats.price": 205000
            },
            "armor-jpc": {
                "description": "Jumpable Plate Carrier designed for high mobility operations. Lightweight design with essential protection for rapid deployment scenarios.",
                "notes": "Lightweight plate carrier optimized for mobility without sacrificing essential protection.",
                "tips": "Perfect for fast-paced operations where speed and agility are more important than maximum protection.",
                "stats.price": 41966
            },
            "armor-police-vest": {
                "description": "Standard police issue soft body armor vest. Designed for patrol duty with protection against common threats while maintaining comfort during extended wear.",
                "notes": "Reliable soft armor for law enforcement operations and civilian protection.",
                "tips": "Good protection against handgun rounds and light rifle fire. Comfortable for extended wear.",
                "stats.price": 14084
            },
            "armor-press-vest": {
                "description": "Civilian press vest with basic ballistic protection. Clearly marked for media personnel operating in conflict zones.",
                "notes": "Basic protection for non-combatant personnel in dangerous areas.",
                "tips": "Minimal protection but clearly identifies the wearer as press. Not suitable for combat operations.",
                "stats.price": 6435
            },
            "armor-raid-explorer-black": {
                "description": "Tactical vest designed for urban exploration and reconnaissance missions. Black coating provides better concealment in low-light environments.",
                "notes": "Tactical vest with stealth-oriented design and moderate protection.",
                "tips": "Good balance of protection and mobility for urban operations. Black color aids concealment at night.",
                "stats.price": 20444
            },
            "armor-raid-explorer-sd": {
                "description": "Sand-colored tactical vest optimized for desert and arid environment operations. Provides reliable protection while blending with sandy terrain.",
                "notes": "Desert camouflage tactical vest with moderate protection and mobility.",
                "tips": "Ideal for operations in sandy or desert environments where concealment is important.",
                "stats.price": 19451
            },
            "armor-rampage": {
                "description": "Aggressive tactical vest designed for assault operations. Features enhanced protection with tactical accessories mounting points.",
                "notes": "High-performance tactical vest with excellent durability and protection.",
                "tips": "Great for sustained combat operations where reliable protection is essential.",
                "stats.price": 42805
            },
            "armor-rampage-od": {
                "description": "Olive drab variant of the Rampage tactical vest. Optimized for woodland and forest operations with enhanced camouflage properties.",
                "notes": "Woodland camouflage version with identical protection to standard Rampage vest.",
                "tips": "Perfect for forest and jungle operations where green/brown camouflage is advantageous.",
                "stats.price": 42805
            },
            "armor-sd-protector": {
                "description": "State-of-the-art full body protection system covering torso, arms, and legs. The ultimate in personal protection for extreme threat environments.",
                "notes": "Maximum protection full body armor system with limb coverage. Extremely heavy but nearly impenetrable.",
                "tips": "Ultimate protection for the most dangerous situations. The weight penalty is severe but the protection is unmatched. Consider mobility carefully.",
                "stats.price": 245000
            },
            "armor-sd-protector-black": {
                "description": "Black variant of the S.D. Protector system optimized for urban and night operations. Provides maximum protection with tactical black finish.",
                "notes": "Black tactical variant of the ultimate protection system. Same performance with enhanced concealment.",
                "tips": "Ideal for urban operations where black camouflage provides an advantage. Maximum protection at maximum weight penalty.",
                "stats.price": 245000
            },
            "armor-security-vest": {
                "description": "Basic security guard vest with minimal ballistic protection. Designed for civilian security applications with comfort prioritized over protection.",
                "notes": "Entry-level protection for security personnel and civilian use.",
                "tips": "Basic protection suitable for low-threat environments. Prioritizes comfort and affordability over protection.",
                "stats.price": 6371
            },
            "armor-soft-armor": {
                "description": "Standard soft body armor using flexible ballistic materials. Provides good protection against handgun rounds while maintaining flexibility.",
                "notes": "Flexible ballistic vest effective against pistol rounds and light rifle fire.",
                "tips": "Good balance of protection and comfort for extended wear. Suitable for patrol and general security work.",
                "stats.price": 20444
            },
            "armor-wdcs": {
                "description": "Woodland Defense Combat System featuring advanced modular protection. Designed for extended operations in varied terrain with arm protection.",
                "notes": "Advanced tactical system with Class 6 torso protection and arm guards.",
                "tips": "High-end armor providing excellent protection with reasonable weight. Includes arm protection for comprehensive coverage.",
                "stats.price": 205000
            },
            "armor-wdcs-swat": {
                "description": "Elite SWAT variant of the WDCS system with enhanced protection and tactical accessories. Designed for high-risk law enforcement operations.",
                "notes": "Elite law enforcement armor with premium materials and enhanced durability retention.",
                "tips": "Top-tier armor for the most dangerous operations. Legendary rarity reflects its exceptional performance and availability.",
                "stats.price": 205000
            },
            "armor-sudden-attack-vest": {
                "description": "Lightweight tactical vest optimized for rapid deployment and surprise attacks. Prioritizes mobility while providing essential protection.",
                "notes": "Ultra-lightweight armor designed for hit-and-run tactics and stealth operations.",
                "tips": "Minimal protection but maximum mobility. Best suited for operations where speed is more important than protection.",
                "stats.price": 9251
            },
            "armor-rampage-bells": {
                "description": "Special holiday variant of the Rampage vest decorated with tactical bells. Limited edition armor with enhanced protection for the festive season.",
                "notes": "Festive limited edition armor with enhanced protection rating. The bells are surprisingly tactical.",
                "tips": "Special holiday armor with better protection than standard Rampage. Collectors item with practical benefits.",
                "stats.price": 63700
            },
            "armor-rampage-skull": {
                "description": "Intimidating skull-decorated variant of the Rampage tactical vest. Designed to strike fear into enemies while providing excellent protection.",
                "notes": "Intimidating skull design with enhanced armor classification for psychological warfare.",
                "tips": "Same reliable Rampage protection with enhanced armor class rating and psychological impact. Perfect for aggressive playstyles.",
                "stats.price": 63700
            }
        },
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