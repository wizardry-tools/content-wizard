### Getting Started

## Requirements

There are two key factors for this project, AEM and the front-end. AEM is 
optional for most visual aspects of the front-end. But if you intend on running
any queries, you have to have an AEM author instance available that the front-end
can run queries against.

macOS, Windows, and Linux should all be supported as build environments.

#### Git

You need to have `git` installed.

#### AEM 

If you intend on running queries, you need to have an AEM Author instance, which you have administrative access.

#### Maven

If you intend on building to AEM, you need Apache Maven `3.3.9` or higher installed, 
which requires Java JRE `1.8` or higher.

#### Node.JS

If you plan on building the front-end yourself and have `node` already installed, you
need to have `node` 18 or higher.

You technically do not need to install or setup node at all, if you have Maven installed.
The maven build sets up a local copy of `node` within the `ui.frontend` module.


## First Steps

1. Fork this repo by using the "Fork" button in the upper-right

2. Check out your fork

   ```sh
   git clone git@github.com:your-name-here/content-wizard.git
   ```


## Build directly to AEM (Optional)

If you want to do a full build and deploy to a local AEM author instance, this command
runs the full build which includes the setup of `node` locally, and also includes the 
OSGI configuration package needed for proper CORS config that allows GraphiQL POST requests.

3. Build and deploy to AEM

   ```sh
   mvn clean install -PautoInstallSinglePackage,localDev
   ```

and you will be able to access the wizard at 
http://localhost:4502/etc/wizardry/tools/content-wizard.html

### Build FE only with Maven (Optional)

If you have Maven installed and would prefer an easy 1-step build for the front-end, 
this command will download and install `node` 18, download the `node` dependencies
automatically.

3. Build front-end only

   ```sh
   mvn clean install
   ```

### Build FE only with Node.JS (Optional)

If you only want to do FE work and don't have Maven or AEM, you can setup your own Node.js
and run the following:

3. Build front-end only without maven

   ```sh
   cd ui.frontend
   npm install
   ```

## Front-end Server (Optional)

4. If you are focused on FE development and want a local React App server, you can run —

   ```sh
   npm start
   ```

Your browser will open the server at http://localhost:3000

##  Making Changes

5. Get coding! If you've added code, add tests. If you've changed APIs, update
   any relevant documentation or tests. Ensure your work is committed within a
   feature branch.

6. Ensure all tests pass, and build everything

   ```sh
   mvn clean install
   ```

   — or —

   ```sh
   cd ui.frontend
   npm test
   ```

7. Prettify the code, so that everything is uniform

   ```sh
   cd ui.frontend
   npm run format
   ```