const fs = require('fs');
const path = require('path');

const iconsModule = require('@tabler/icons-react');

const jsonPath = path.resolve(__dirname, '../../utils/tabler-icons.json');


try {
    let rawExports = iconsModule;

    if (rawExports.__esModule && rawExports.default) {
        rawExports = rawExports.default; // Check for Babel/ESM default wrapping
    }
    // TablerIcons exports are primarily React Function Components.
    const iconNames = Object.keys(rawExports).filter(key => {
        const value = rawExports[key];
        // console.log(key);
        // Check for common naming convention (starts with 'Icon') and function/class (React Component check)
        return key.startsWith('Icon') && (typeof value === 'function' || (typeof value === 'object' && value !== null && value.render)); 
    });
    
    if (iconNames.length === 0) {
        // Fallback: If exports are zero, throw an explicit error message that tells the user the name of the object.
         console.error("FATAL: Resolved icon module is empty. Found no exports in:", Object.keys(iconsModule).join(', '));
         throw new Error("Icon resolution failed.");
    }

    fs.writeFileSync(jsonPath, JSON.stringify(iconNames, null, 2));

    console.log('✅ Final cleanup successful. Tabler icon list regenerated for WordPress.');


} catch (error) {
    console.error('❌ FATAL ERROR: Failed to manage final build scripts:');
    console.error(error.message);
    process.exit(1);
}