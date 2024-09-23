const fs = require('fs-extra');
const path = require('path');

const srcFolder = path.join(__dirname, 'src');
const buildChrome = path.join(__dirname, 'build-chrome');
const buildFirefox = path.join(__dirname, 'build-firefox');
const manifestFile = 'manifest.json';

async function updateManifest(buildFolder, browser) {
    const manifestPath = path.join(buildFolder, manifestFile);

    let manifest = await fs.readJSON(manifestPath);
    if (browser === 'chrome') {
        manifest['background'] = { service_worker: 'background.js'};
    } else if (browser === 'firefox') {
        manifest['background'] = { scripts: ['background.js']};
        manifest['browser_specific_settings'] = { gecko: { id: 'jullienfelix@gmail.com' } };
    }

    await fs.writeJSON(manifestPath, manifest, { spaces: 2 });
}

async function build() {
    try {
        await fs.copy(srcFolder, buildChrome);
        await fs.copy(srcFolder, buildFirefox);

        await updateManifest(buildChrome, 'chrome');
        await updateManifest(buildFirefox, 'firefox');

        console.log('Build completed for Chrome and Firefox.');
    } catch (err) {
        console.error('Error during build:', err);
    }
}

// Run the build process
build();
