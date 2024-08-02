# Frontend Build: React + TypeScript + Vite

This project was bootstrapped with [create-react-app](https://github.com/facebook/create-react-app). And then heavily modified, and then migrated to [vite](https://vitejs.dev/).

This project is now a simple static React SPA that integrates with OOTB AEM Search capabilities.

## Stack
* Node v20.14.0
* React v18.3.1
* Typescript v5.2.2
* Vite v5.3.4

Note: Internet Explorer is not supported.

## Scripts

In the project directory, you can run the following commands:

### `npm i`

Installs node dependencies.

### `npm run dev`

Runs the app in development mode by proxying requests to an AEM instance running at http://localhost:4502. This assumes that the entire project has been deployed to AEM at least once (`mvn clean install -PautoInstallPackage` **in the project root**).

After running `npm run dev` **in the `ui.frontend` directory**, your app will be automatically opened in your browser (at path http://localhost:3000). If you make edits, the page will reload.

If you are getting errors related to CORS, you might want to configure AEM as follows:

1. Navigate to the Configuration Manager (http://localhost:4502/system/console/configMgr)
2. Open the configuration for "Adobe Granite Cross-Origin Resource Sharing Policy"
3. Create a new configuration with the following additional values:
    - Allowed Origins: http://localhost:3000
    - Supported Headers: Authorization
    - Allowed Methods: OPTIONS

Note: If you intend on running the local server, you'll want to change the proxy to match your own AEM address.

### `npm run lint`

Runs ESLint.

### `npm run lint:fix`

Runs ESLint and auto fixes simple issues.

### `npm test` OR `npm run test`

Runs the Vitest Unit Tests.
Launches the test runner in the interactive watch mode. See the [vitest guide](https://vitest.dev/guide/) for more information.

### `npm run coverage`

Runs the Vitest Unit Tests with coverage reporting.

### `npm run build`

Builds the app for production to the `build` folder. It bundles React in production mode and optimizes the build for the best performance. See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

Furthermore, an AEM ClientLib is generated from the app using the [`aem-clientlib-generator`](https://github.com/wcm-io-frontend/aem-clientlib-generator) package.

## Browser Support

By default, this project uses [Browserslist](https://github.com/browserslist/browserslist)'s `defaults` option to identify target browsers. Additionally, it includes polyfills for modern language features to support older browsers (e.g. Internet Explorer 11). If supporting such browsers isn't a requirement, the polyfill dependencies and imports can be removed.


## Code Splitting

The React app is configured to make use of [code splitting](https://webpack.js.org/guides/code-splitting) by default. When building the app for production, the code will be output in several chunks:

```sh
$ ls dist/content-wizard/resources/chunks
name.hash.chunk.js
name.hash.chunk.js.map
```

```sh
$ ls dist/content-wizard/resources/js
bundle.js
bundle.js.map
```

Loading chunks only when they are required can improve the app performance significantly.

This build and deployment logic requires that the AEM Page request the bundle.js directly, instead of using the ClientLibrary Manager to resolve the initial JS. It's the easiest way to get ES Modules to load correctly. There is potential to refactor the ClientLibrary generation/deployment.

This build also uses the [@aem-vite/vite-aem-plugin](https://www.aemvite.dev/) plugin to generate the clientlib structure and dynamic import mappings. This project does not use the related AEM/Maven dependency by `aem-vite`. No third-party AEM dependencies is a project requirement.

## Additional Development Support

### Proxy Host
By default, the proxy is configured for http://localhost:4502. If your "local" development instance has an alternative domain/host, you can update the `VITE_HOST_URI` property in `.env.development`. You can alternatively set a `VITE_PRIVATE_HOST_URI` in your bash environment variables, instead of updating the `.env.development` file.

### Fast Iterations

When developing UI Features, you can easily and quickly test against changes by using the built-in Vite Server. No need to deploy to AEM beyond the initial installation. The build was migrated from CRA to Vite, in order to make use of Fast Refresh and SWC, which is considerably faster than CRA.

If you need to re-deploy the frontend Build to AEM, the fastest approach is to run the vite build manually with `npm run build` here in `ui.frontend` directory, followed by `mvn clean install -P autoInstallPackage` from the `../ui.apps` directory.
