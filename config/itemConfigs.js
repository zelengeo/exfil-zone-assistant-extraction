const {stringTable} = require("./stringTable")
const configBase = {
    baseDirectory: "D:/exfilzone_data/extracted/Exports/Contractors_Showdown/Content/Blueprints/GameModes/Warfare",
    extractData: (element, fileName, subcategory) => {
        const properties = element.Properties;
        const info = properties.Info || properties.Info_0;
        const iconObjectPath = info["Icon_11_BA1E5C224783410CB10781B70CE5A463"].ObjectPath;
        const displayName = info["DisplayName_2_E87F8CE0471A0D0F627BBA9F7E5EE752"];


        return {
            sourceFile: `${fileName}.json`,
            type: element.Type,
            template: element.Template.ObjectPath,
            name: element.Name,
            displayName: displayName ? displayName.LocalizedString : null,
            icon: iconObjectPath ? iconObjectPath.substring(iconObjectPath.lastIndexOf('/') + 1).split('.')[0] : null,
            subcategory: subcategory,
            rarity: properties.Rarity || null,
            weight: properties.Weight || null,
        }
    },

    requiredAttributes: [
        'id', 'name', 'description', 'category', 'subcategory',
        'images.icon', 'images.thumbnail', 'images.fullsize',
        'stats.rarity', 'stats.price', 'stats.weight',
        'tips'
    ]
}

const itemConfigs = {
    food: {
        baseDirectory: './food-data',
        outputFile: 'extracted_food_data.json',
        finalOutputFile: 'food.json',
        category: 'provisions',

        // Extraction configuration
        extraction: {
            findElement: (data, fileName) => data.find(item =>
                item.Type && item.Type.startsWith(fileName)
            ),

            extractData: (element, fileName, subcategory) => {
                return {
                    ...configBase.extractData(element, fileName, subcategory),
                    capacity: properties.Capacity || null,
                    threshold: properties.Threshold || null,
                    consumptionSpeed: properties.ConsumptionSpeed || null,
                    energyFactor: properties.EnergyFractor || null,
                    hydraFactor: properties.HydraFractor || null
                };
            }
        },

        // Transformation configuration
        transformation: {
            generateId: (itemData) => `food_${itemData.displayName.toLowerCase().replace(/\s+/g, '_')}`,

            mapToFinalFormat: (itemData) => ({
                id: itemData.id,
                name: itemData.displayName,
                description: "",
                category: 'provisions',
                subcategory: ((itemData.subcategory === 'Biscuits') || (itemData.subcategory === 'RaspBerry')) ? "Food" : "Drinks",
                images: {
                    icon: `/images/items/food/${itemData.icon}.webp`,
                    thumbnail: `/images/items/food/${itemData.icon}.webp`,
                    fullsize: `/images/items/food/${itemData.icon}.webp`
                },
                stats: {
                    price: itemData.price || 0,
                    weight: itemData.weight,
                    rarity: 'Common',
                    capacity: itemData.capacity,
                    threshold: itemData.threshold,
                    consumptionSpeed: itemData.consumptionSpeed,
                    energyFactor: itemData.energyFactor,
                    hydraFactor: itemData.hydraFactor
                },
                tips: ''
            }),

            requiredAttributes: [
                ...configBase.requiredAttributes,
                'stats.capacity', 'stats.threshold', 'stats.consumptionSpeed', 'stats.energyFactor', 'stats.hydraFactor'
            ]
        }
    },

    keys: {
        baseDirectory: configBase.baseDirectory + '/House',
        outputFile: 'extracted_key_data.json',
        finalOutputFile: 'keys.json',
        category: 'keys',

        // Extraction configuration
        extraction: {
            findElement: (data, fileName) => data.find(item =>
                item.Type && item.Type.startsWith(fileName)
            ),

            extractData: (element, fileName, subcategory) => {
                const newSubcategory = subcategory.includes("Map1") ? "Suburb" : subcategory.includes("Map2") ? "Dam" : subcategory.includes("Map3") ? "Metro" : "Resort"
                const extractedData = {
                    ...configBase.extractData(element, fileName, subcategory),
                    subcategory: newSubcategory,
                };

                if (extractedData.sourceFile.startsWith("BP") ) {
                    return null
                }

                return extractedData;
            }
        },

        // Transformation configuration
        transformation: {
            generateId: (itemData) => {
                const nameWithoutExt = itemData.sourceFile.substring(0, itemData.sourceFile.lastIndexOf('.'));

                const firstUnderscoreIndex = nameWithoutExt.indexOf('_');
                if (firstUnderscoreIndex === -1) {
                    return ''; // No underscores found.
                }

                // Find the second underscore, starting the search after the first one.
                const secondUnderscoreIndex = nameWithoutExt.indexOf('_', firstUnderscoreIndex + 1);
                if (secondUnderscoreIndex === -1) {
                    return ''; // Only one underscore found.
                }

                // Return the part of the string after the second underscore.
                const id = nameWithoutExt.substring(secondUnderscoreIndex + 1);
                return `key_${id.toLowerCase()}`
            },

            mapToFinalFormat: (itemData) => {

                //Build gameid
                const nameWithoutExt = itemData.sourceFile.substring(0, itemData.sourceFile.lastIndexOf('.'));
                const firstUnderscoreIndex = nameWithoutExt.indexOf('_');
                if (firstUnderscoreIndex === -1) {
                    return ''; // No underscores found.
                }
                // Find the second underscore, starting the search after the first one.
                const secondUnderscoreIndex = nameWithoutExt.indexOf('_', firstUnderscoreIndex + 1);
                if (secondUnderscoreIndex === -1) {
                    return ''; // Only one underscore found.
                }
                // Return the part of the string after the second underscore.
                const idBase = nameWithoutExt.substring(secondUnderscoreIndex + 1);

                const maps = ["Suburb", "Dam", "Metro", "Resort"]

                //Temp solution for value injecting (should find how to extract following values)
                const tempGameId = {
                    key_mall_campshop:  "card.map1.campshop",
                    key_policeoffice_f2:  "card.map1.bear-police-f2",
                    key_police_f1: "card.map1.bear-police-f1",
                    key_westbunker: "card.map1.basementexit",
                    key_mid_bunker: "card.map2.midbunker",
                    key_factory_b: "card.map2.factory_1",
                    key_factory_a1: "card.map2.factory_2",
                    key_f3_factoryroom: "card.map3.FactoryRoom" ,

                }
                let gameId
                if (tempGameId[itemData.id]) {
                    gameId = tempGameId[itemData.id]
                } else {
                    gameId = `card.map${maps.indexOf(itemData.subcategory)+1}.${idBase.toLowerCase()}`
                    if (!stringTable[gameId+"_name"]) {
                        gameId = `card.map${maps.indexOf(itemData.subcategory)+1}.${idBase}`
                    }
                }


                const hardcodedRarityMap = {
                    key_highbuilding_shop: "Epic",
                    key_mall_campshop: "Legendary",
                    key_mall_chaneo: "Legendary",
                    key_motel_201: "Rare",
                    key_motel_206: "Rare",
                    key_policeoffice_f2: "Legendary",
                    key_police_f1: "Legendary",
                    key_westbunker: "Epic",
                    key_wyethfarm: "Rare",
                    key_clifton_shop: "Epic",
                    key_dam_station_east: "Epic",
                    key_dam_station_west: "Epic",
                    key_dockhouse: "Legendary",
                    key_factory_a1: "Legendary",
                    key_factory_b: "Legendary",
                    key_mid_bunker: "Epic",
                    key_datastorage: "Legendary",
                    key_exitlock_f3_sewer: "Epic",
                    key_exitlock_trainroad: "Epic",
                    key_officerroom: "Legendary",
                    key_operatingroom: "Epic",
                    key_apartment: "Epic",
                    key_bankf2: "Legendary",
                    key_hospitalf2: "Rare",
                    key_resorthotel: "Rare",
                    key_tunnel: "Legendary",
                    key_voyages: "Epic"
                }



                return {
                    id: itemData.id,
                    name: stringTable[gameId+"_name"],
                    description: "",
                    category: "keys",
                    subcategory: itemData.subcategory,
                    //TODO import images too...
                    images: {
                        icon: `/images/items/keys/${itemData.icon}.webp`,
                        thumbnail: `/images/items/keys/${itemData.icon}.webp`,
                        fullsize: `/images/items/keys/${itemData.icon}.webp`
                    },
                    stats: {
                        price: itemData.price ?? 1000,
                        weight: itemData.weight ?? 0.1,
                        rarity: itemData.rarity ?? hardcodedRarityMap[itemData.id] ?? "Uncommon",
                    },
                    gameId,
                    tips: ''
                }
            },

            hardcodedValues: [
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
            ],

            requiredAttributes: [
                ...configBase.requiredAttributes,
            ]
        }
    },


    // Add more item types here
    weapons: {
        baseDirectory: './weapon-data',
        outputFile: 'extracted_weapon_data.json',
        finalOutputFile: 'weapons.json',
        category: 'weapons',
        // ... weapon-specific configuration
    },

    ammo: {
        baseDirectory: './ammo-data',
        outputFile: 'extracted_ammo_data.json',
        finalOutputFile: 'ammo.json',
        category: 'ammo',
        // ... ammo-specific configuration
    }
};

module.exports = { itemConfigs };