/* eslint-disable import/no-extraneous-dependencies */
const https = require('follow-redirects').https;
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const { exec } = require('child_process');

// Build icons
console.log('Building icons:\n - Downloading icon archive...');

const file = fs.createWriteStream('./icons.zip');
https.get({
    hostname: 'api.github.com',
    path: '/repos/Templarian/MaterialDesign-SVG/zipball/master',
    headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'UOMA/DEV-UPDATER',
    },
}, (response) => {
    file.on('finish', () => {
        file.close();

        console.log(' - File saved.');

        rimraf('./icons', () => {
            const zipFile = new AdmZip('./icons.zip');
            zipFile.getEntries().forEach((zipEntry) => {
                if (!zipEntry.isDirectory) {
                    zipFile.extractEntryTo(zipEntry.entryName, `./icons/${zipEntry.entryName.split('/').slice(1, -1).join('/')}`, false, true);
                }
            });

            fs.unlinkSync('./icons.zip');
            console.log(' - Icons extracted. Checking used icons...');

            const filteredList = [];
            const usedList = JSON.parse(fs.readFileSync('./scripts/icons.json').toString());
            const iconList = JSON.parse(fs.readFileSync('./icons/meta.json').toString());

            for (const icon of iconList) {
                if (usedList.includes(icon.name)) {
                    filteredList.push(icon);
                }
            }

            if (usedList.length !== filteredList.length) {
                console.log(` - WARNING: ${usedList.length} icons used, but only ${filteredList.length} icons built. Icons below are missing:`);
                for (const icon of usedList) {
                    if (!filteredList.find((i) => i.name === icon)) {
                        console.log(`  - ${icon}`);
                    }
                }
            } else {
                console.log(` - ${usedList.length} icons used.`);
            }

            fs.writeFileSync('./icons/meta.json', JSON.stringify(filteredList));

            console.log(' - Building icons...');

            fs.readdirSync('./icons/svg').forEach((fileName) => {
                if (fileName.endsWith('.svg')) {
                    if (!filteredList.find((i) => `${i.name}.svg` === fileName || new RegExp(`uF([A-F]|\\d){4}-${i.name}.svg`).test(fileName))) {
                        fs.unlinkSync(`./icons/svg/${fileName}`);
                    }
                }
            });

            exec('npx --yes @mdi/font-build', {
                cwd: `${process.cwd()}/icons`,
            }, (error, stdout) => {
                if (error) {
                    console.log(` - Error: ${error}`);
                    return;
                }
                console.log(stdout);

                fs.writeFileSync('./icons/dist/css/materialdesignicons.min.css', fs.readFileSync('./icons/dist/css/materialdesignicons.min.css').toString().replace('\n/*# sourceMappingURL=materialdesignicons.css.map */', ''));

                rimraf('./public/icons', () => {
                    fs.copySync('./icons/dist/css/materialdesignicons.min.css', './public/icons/css/materialdesignicons.min.css');
                    fs.copySync('./icons/dist/fonts', './public/icons/fonts');

                    rimraf('./icons', () => {
                        console.log(' - Done.');
                    });
                });
            });
        });
    });

    response.pipe(file);
});
