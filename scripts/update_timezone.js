/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const { rawTimeZones } = require('@vvo/tzdb');

// Update timezone list
console.log('Update timezone list:\n - Rebuilding list...');
const tzList = [];
for (const item of rawTimeZones) {
    tzList.push({
        name: item.name,
        countryName: item.countryName,
        mainCity: item.mainCities[0],
    });
}
fs.unlinkSync('./src/tools/tzList.json');
fs.writeFileSync('./src/tools/tzList.json', JSON.stringify(tzList, null, 4));
console.log(` - ${tzList.length} items rebuilt.`);
