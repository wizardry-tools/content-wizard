const fs = require('fs-extra');
const path = require('path');

const srcDir = path.resolve(__dirname, '../dist');
console.log("srcDir: ", srcDir);
const destDir = path.resolve(__dirname, '../..', 'ui.apps/src/main/content/jcr_root', 'apps/content-wizard/clientlibs', 'clientlib-react');
console.log("destDir: ", destDir);

async function copyDist() {
  try {
    await fs.remove(destDir); // Remove the existing contents of the destination directory
    await fs.copy(srcDir, destDir); // Copy the contents of the dist directory to the destination
    console.log('Successfully copied dist to ui.apps');
  } catch (err) {
    console.error('Error copying dist to Maven module:', err);
  }
}

copyDist().then();