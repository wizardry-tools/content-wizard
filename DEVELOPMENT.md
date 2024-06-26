### Getting Started

Please note that we require a signed GraphQL Specification Membership agreement
before landing a contribution. This is checked automatically when you open a PR.
If you have not signed the membership agreement (it's free), you will be
prompted by the EasyCLA bot. For more details, please see the
[GraphQL WG repo](https://github.com/graphql/graphql-wg/tree/main/membership).

0. First, you will need the latest `git`, `yarn` 1.16, & `node` 12 or greater.
   macOS, Windows and Linux should all be supported as build environments.

_**Note:** None of the commands below will work with `npm`. Please use `yarn` in
this repo._

1. Fork this repo by using the "Fork" button in the upper-right

2. Check out your fork

   ```sh
   git clone git@github.com:your-name-here/graphiql.git
   ```

3. Install or Update all dependencies

   ```sh
   mvn clean install
   ```

   — or FE dependencies only —

   ```sh
   cd ui.frontend
   npm install
   ```

4. Build all interdependencies so the project you are working on can resolve
   other packages

   First you'll need —

   ```sh
   mvn clean install
   ```

   — or —

   ```sh
   cd ui.frontend
   npm install
   ```

   If you are focused on FE development and want a local React App server, you can run —

   ```sh
   npm start
   ```

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


### Run tests for ui.frontend:
The test are ran automatically for maven builds. The frontend tests cannot be disabled without modifying the npm package file.
- `mvn clean install` will run the frontend tests

The frontend tests can be ran independently with a watch mode
- ```sh
  cd ui.frontend
  npm test
  ```
