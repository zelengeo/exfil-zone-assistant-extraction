const {stringTable} = require("./stringTable")

const rarityMap = {
    "EWarfare_Quality::NewEnumerator0": "Common",
    "EWarfare_Quality::NewEnumerator1": "Uncommon",
    "EWarfare_Quality::NewEnumerator2": "Rare",
    "EWarfare_Quality::NewEnumerator3": "Epic",
    "EWarfare_Quality::NewEnumerator4": "Legendary",
    "EWarfare_Quality::NewEnumerator5": "Ultimate",
}


const configBase = {
    baseDirectory: "D:/exfilzone_data/extracted/Exports/Contractors_Showdown/Content/Blueprints/GameModes/Warfare",
    extractData: (element, data, fileName, directory) => {
        const properties = element.Properties;
        const info = properties["warfare Prop Info"] || properties.Info || properties.Info_0;
        const iconObjectPath = info["Icon_11_BA1E5C224783410CB10781B70CE5A463"].ObjectPath;
        const displayName = info["DisplayName_2_E87F8CE0471A0D0F627BBA9F7E5EE752"];
        const rarity = info["Quality_8_A8290BF9475A0928D1614B82C6FDBFF4"] ? rarityMap[info["Quality_8_A8290BF9475A0928D1614B82C6FDBFF4"]] : null;
        const subcategory = directory.substring(directory.lastIndexOf('/') + 1)


        return {
            sourceFile: `${fileName}.json`,
            type: element.Type,
            template: element.Template.ObjectPath,
            name: element.Name,
            displayName: displayName ? displayName.LocalizedString : null,
            icon: iconObjectPath ? iconObjectPath.substring(iconObjectPath.lastIndexOf('/') + 1).split('.')[0] : null,
            subcategory,
            rarity,
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
        outputFile: 'food_data',
        finalOutputFile: 'food',
        category: 'provisions',
        itemType: 'provisions',

        // Extraction configuration
        extraction: {
            findElement: (data, fileName) => data.find(item =>
                item.Type && item.Type.startsWith(fileName)
            ),

            extractData: (element, data, fileName, directory) => {
                return {
                    ...configBase.extractData(element, data, fileName, directory),
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
                subcategory: ((itemData.directory === 'Biscuits') || (itemData.directory === 'RaspBerry')) ? "Food" : "Drinks",
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

    holsters: {
        baseDirectory: configBase.baseDirectory + '/TecVest',
        outputFile: 'holster_data',
        finalOutputFile: 'holsters',
        category: 'gear',
        itemType: 'holsters',

        // Extraction configuration
        extraction: {
            findElement: (data, fileName) => data.find(item =>
                fileName.includes("VestHolster") && item.Type && item.Type.startsWith(fileName)
            ),

            extractData: (element, data, fileName, directory) => {
                const extractedData = {
                    ...configBase.extractData(element, data, fileName, directory),
                    subcategory: "Holsters",
                    content: null,
                    canAttach: null
                };

                //content
                let totalWidth = element.Properties.TotalWidth
                if (!totalWidth && extractedData.template === "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/TecVest/VestHolster.50") {
                    totalWidth = 3.1
                }
                if (totalWidth) {
                    extractedData.content = element.Properties.PropInfo.map(prop => ({
                        [prop.Key]: Math.floor(totalWidth/(prop.Value.HalfWidth_42_152E25204555C2CC1D55A79BE2F930F1*2))
                    }))
                }


                //canAttach
                if (element.Properties.AttachHolsterClass) {
                    extractedData.canAttach = element.Properties.AttachHolsterClass.map(prop => {
                        const lastPart = prop.Key.substring(prop.Key.lastIndexOf('.') + 1).replaceAll("'", "");

                        // Remove the '_C' suffix if it exists.
                        const withoutC = lastPart.endsWith('_C') ? lastPart.slice(0, -2) : lastPart;

                        // Find the last '_' and get the substring after it.
                        const assetName = withoutC.substring(withoutC.lastIndexOf('_') + 1);

                        return assetName;
                    })
                }
                


                return extractedData;
            },
        },

        // Transformation configuration
        transformation: {
            generateId: (itemData) => {
                let idBase = itemData.sourceFile;
                const lastPart = idBase.replace(".json", "").replaceAll("'", "");

                // Remove the '_C' suffix if it exists.
                const withoutC = lastPart.endsWith('_C') ? lastPart.slice(0, -2) : lastPart;

                // Find the last '_' and get the substring after it.
                const assetName = withoutC.substring(withoutC.lastIndexOf('_') + 1);

                return `holster_${assetName.replaceAll(".", "").toLowerCase()}`
            },

            mapToFinalFormat: (itemData) => {
                return {
                    id: itemData.id,
                    name: itemData.displayName,
                    description: "",
                    category: "gear",
                    subcategory: itemData.subcategory,
                    images: {
                        icon: `/images/items/holsters/${itemData.icon}.webp`,
                        thumbnail: `/images/items/holsters/${itemData.icon}.webp`,
                        fullsize: `/images/items/holsters/${itemData.icon}.webp`
                    },
                    stats: {
                        price: itemData.price ?? 1000,
                        weight: itemData.weight ?? 2,
                        rarity: itemData.rarity ?? "Common",
                        canAttach: itemData.canAttach ? itemData.canAttach.map(item => "holster_" + item.toLowerCase()) : []
                    },
                    tips: ''
                }
            },

            requiredAttributes: [
                ...configBase.requiredAttributes,
            ]
        }
    },

    backpacks: {
        baseDirectory: configBase.baseDirectory + '/Backpack',
        outputFile: 'backpacks_data',
        finalOutputFile: 'backpacks',
        category: 'gear',
        itemType: 'backpacks',

        // Extraction configuration
        extraction: {
            findElement: (data, fileName) => data.find(item =>
                item.Type && item.Type.startsWith(fileName)
            ),

            extractData: (element, data, fileName, directory) => {
                const extractedData = {
                    ...configBase.extractData(element, data, fileName, directory),
                    subcategory: "Backpacks",
                    sizes: null
                };


                // Sizes
                const backPackSizeObject = data.find(item =>
                    item.Type && item.Type.startsWith('BackpackStorage_C')
                )

                if (backPackSizeObject?.Properties?.Bound) {
                    extractedData.sizes = backPackSizeObject.Properties.Bound
                }

                // Attachment points
                const attachmentPoints = data.filter(item => item.Type && item.Type.startsWith("BackpackAttachPoint_C")).map(item => {
                    return {
                        tag: item.Properties.Tag,
                        classes: item.Properties?.AttachmentClasses.map(clas => clas.ObjectName.replace("BlueprintGeneratedClass", ""))
                    }
                })
                extractedData.attachmentPoints = attachmentPoints;

                // Defaults.
                if (!extractedData.weight && extractedData.template.endsWith('WarfareBackpackBase.53')) {
                    extractedData.weight = 2.0;
                }
                if (!extractedData.rarity && extractedData.template.endsWith('WarfareBackpackBase.53')) {
                    extractedData.rarity = rarityMap["EWarfare_Quality::NewEnumerator0"];
                }

                return extractedData;
            },
        },

        // Transformation configuration
        transformation: {
            generateId: (itemData) => {
                let idBase;
                if (itemData.sourceFile.includes("WarfareBackpackBase_")) {
                    idBase = itemData.sourceFile.replace("WarfareBackpackBase_", "").replace(".json", "")
                } else if (itemData.sourceFile.includes("WarfareBackpack_")) {
                    idBase = itemData.sourceFile.replace("WarfareBackpack_", "").replace(".json", "")
                } else if (itemData.sourceFile.includes("WF_Backpack_")) {
                    idBase = itemData.sourceFile.replace("WF_Backpack_", "").replace(".json", "")
                } else {
                    idBase = itemData.displayName.indexOf(' ') !== -1 ? itemData.displayName.substring(0, itemData.displayName.indexOf(' ')) : itemData.displayName;
                }

                return `backpack_${idBase.replaceAll(".", "").toLowerCase()}`
            },

            mapToFinalFormat: (itemData) => {
                const classNameMap = {
                    'ContractorsPrimaryGun_C': 'PrimaryGun',
                    'ContractorsPumpActionShotgun_C': 'Shotgun',
                    'VestHolster_C': 'Holster',
                    'WarfareTecVest_C': 'Vest',
                    'WarfareHelmet_C': 'Helmet',
                };

                // 2. Group classes by their tag in an intermediate object.
                const groupedByTag = itemData.attachmentPoints.reduce((acc, point) => {
                    const {tag, classes} = point;

                    // Initialize the array for this tag if it doesn't exist yet.
                    if (!acc[tag]) {
                        acc[tag] = [];
                    }

                    // Clean up and map class names, then add them to the corresponding tag.
                    const mappedClasses = classes.map(c => {
                        const cleanClassName = c.replace(/'/g, ''); // Remove single quotes
                        return classNameMap[cleanClassName] || cleanClassName; // Use mapped name or original if not found
                    });

                    acc[tag].push(...mappedClasses);
                    return acc;
                }, {});

                // 3. Process the grouped data to create the final, compact output.

                // Remove duplicates from each tag's class list using a Set.
                for (const tag in groupedByTag) {
                    groupedByTag[tag] = [...new Set(groupedByTag[tag])];
                }

                // Check if 'left' and 'right' tags exist and have identical classes.
                const leftClasses = groupedByTag.left;
                const rightClasses = groupedByTag.right;

                if (leftClasses && rightClasses) {
                    // Sort arrays to ensure comparison is not affected by order.
                    const sortedLeft = [...leftClasses].sort();
                    const sortedRight = [...rightClasses].sort();

                    // If they are identical, create a 'sides' tag and remove the originals.
                    if (JSON.stringify(sortedLeft) === JSON.stringify(sortedRight)) {
                        groupedByTag.sides = sortedLeft;
                        delete groupedByTag.left;
                        delete groupedByTag.right;
                    }
                }

                // 4. Convert the processed object back into an array of objects.
                const finalResult = Object.keys(groupedByTag).map(tag => ({
                    tag: tag,
                    types: groupedByTag[tag]
                }));

                return {
                    id: itemData.id,
                    name: itemData.displayName,
                    description: "",
                    category: "gear",
                    subcategory: itemData.subcategory,
                    images: {
                        icon: `/images/items/backpacks/${itemData.icon}.webp`,
                        thumbnail: `/images/items/backpacks/${itemData.icon}.webp`,
                        fullsize: `/images/items/backpacks/${itemData.icon}.webp`
                    },
                    stats: {
                        price: itemData.price ?? 1000,
                        weight: itemData.weight ?? 2,
                        rarity: itemData.rarity ?? "Common",
                        sizes: `${itemData.sizes.X}x${itemData.sizes.Y}x${itemData.sizes.Z}`,
                        attachmentPoints: finalResult,
                    },
                    tips: ''
                }
            },

            requiredAttributes: [
                ...configBase.requiredAttributes,
                'stats.sizes', 'stats.attachmentPoints',
            ]
        }
    },

    keys: {
        baseDirectory: configBase.baseDirectory + '/House',
        outputFile: 'keys_data',
        finalOutputFile: 'keys',
        category: 'keys',
        itemType: 'keys',

        // Extraction configuration
        extraction: {
            findElement: (data, fileName) => data.find(item =>
                item.Type && item.Type.startsWith(fileName)
            ),

            extractData: (element, data, fileName, directory) => {
                const newSubcategory = directory.includes("Map1") ? "Suburb" : directory.includes("Map2") ? "Dam" : directory.includes("Map3") ? "Metro" : "Resort"
                const extractedData =
                    {
                        ...
                            configBase.extractData(element, data, fileName, directory),
                        subcategory:
                        newSubcategory,
                    }
                ;

                if (extractedData.sourceFile.startsWith("BP")) {
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

            mapToFinalFormat:
                (itemData) => {

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
                        key_mall_campshop: "card.map1.campshop",
                        key_policeoffice_f2: "card.map1.bear-police-f2",
                        key_police_f1: "card.map1.bear-police-f1",
                        key_westbunker: "card.map1.basementexit",
                        key_mid_bunker: "card.map2.midbunker",
                        key_factory_b: "card.map2.factory_1",
                        key_factory_a1: "card.map2.factory_2",
                        key_f3_factoryroom: "card.map3.FactoryRoom",

                    }
                    let gameId
                    if (tempGameId[itemData.id]) {
                        gameId = tempGameId[itemData.id]
                    } else {
                        gameId = `card.map${maps.indexOf(itemData.subcategory) + 1}.${idBase.toLowerCase()}`
                        if (!stringTable[gameId + "_name"]) {
                            gameId = `card.map${maps.indexOf(itemData.subcategory) + 1}.${idBase}`
                        }
                    }


                    return {
                        id: itemData.id,
                        name: stringTable[gameId + "_name"],
                        description: "",
                        category: "keys",
                        subcategory: itemData.subcategory,
                        images: {
                            icon: `/images/items/keys/${itemData.icon}.webp`,
                            thumbnail: `/images/items/keys/${itemData.icon}.webp`,
                            fullsize: `/images/items/keys/${itemData.icon}.webp`
                        },
                        stats: {
                            price: itemData.price ?? 1000,
                            weight: itemData.weight ?? 0.1,
                            rarity: itemData.rarity ?? "Uncommon",
                        },
                        gameId,
                        tips: ''
                    }
                },

            requiredAttributes:
                [
                    ...configBase.requiredAttributes,
                ]
        }
    },

// Add more item types here
    weapons: {
        baseDirectory: './weapon-data',
        outputFile:
            'weapon_data',
        finalOutputFile:
            'weapons',
        category:
            'weapons',
        itemType: 'weapons',
        // ... weapon-specific configuration
    }
    ,

    ammo: {
        baseDirectory: './ammo-data',
        outputFile:
            'ammo_data',
        finalOutputFile:
            'ammo',
        category:
            'ammo',
        itemType: 'ammo',
        // ... ammo-specific configuration
    }
}

module.exports = {itemConfigs};