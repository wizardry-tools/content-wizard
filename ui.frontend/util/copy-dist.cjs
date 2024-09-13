const fs = require('fs-extra');
const path = require('path');



/**
 * This function will copy all contents of the FE build directory '../dist',
 * to the appropriate ClientLibrary folder within the ui.apps module.
 * @returns {Promise<void>}
 */
async function copyDist() {
  // can pass src and dest as CLI args
  const args = process.argv;
  // default values
  const src = args[2] || '../dist';
  const dest = args[3] || '../../ui.apps/src/main/content/jcr_root/apps/content-wizard/clientlibs';
  const srcDir = path.resolve(__dirname, src);
  const destDir = path.resolve(__dirname, dest);
  try {
    await fs.remove(destDir); // Remove the existing contents of the destination directory
    await fs.copy(srcDir, destDir); // Copy the contents of the dist directory to the destination
    console.log(`Successfully copied [${src}] to [${dest}]`);
  } catch (err) {
    console.error(`Error copying [${src}] to Maven module:`, err);
  }
}


copyDist().then()