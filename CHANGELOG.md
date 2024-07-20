
## Content Wizard 1.1.4 - July TBD, 2024

- Refactored the Results exporting logic to use a Dialog with a configuration form, that allows the user to specify file type, file name, and if the file name should include a timestamp.
- Converted Dialog Close buttons into IconButtons from FABs, and cleaned up dialog styles.
- Implemented the Package Builder Dialog, which allows users to Create and Build a Content Package for CRX PackageManager, based on the results.

## Content Wizard 1.1.3 - July 18, 2024

- Added Sorting and Filtering capabilities to the Results Table
- Improved the UI and scrolling experience of the Results Table
- Improved the README and DEVELOPMENT docs
- Additional visual improvements.

## Content Wizard 1.1.2 - July 14, 2024

- Refactored Storage logic again, to use TS functions instead of TS classes.
- Fixed Query History and IDE Tab logic so that tab state and query labels are working correctly for all Query Languages.
- Refactored Providers adding more unique providers and simplifying the existing ones, which fixed a circular rendering.
- Refactored usage of timeouts to use the latest React best practices
- Added Export to CSV option for the Results Table
- Added a custom Logging framework that allows us to retain logging statements for local development and disables the statements for production builds.
- Additional performance and visual improvements.


## Content Wizard 1.1.1 - July 10, 2024

- Fixed DatePickers logic, so that it doesn't display a date when one hasn't been picked
- Performance improvements 
- Implemented the Result Explorer that lets you load and review the JSON of an individual result. Also contains quick links into AEM. This expands the Results View's capabilities
- Fixed an issue with the Alerts not displaying correctly
- Additional performance and visual improvements.

## Content Wizard 1.1.0 - July 6, 2024

- Refactored Swipeable Views to use Typescript
- Fixed eslint and babel configurations
- Fixed prettier config and prettified all code
- Heavily reorganized project code
- Implemented Alert Messaging
- Implemented statement viewer for Query Wizard
- Refactored and extended the Storage functionality to support any Query
- Introduced module aliases so that local module imports can have shorter paths.
- Additional performance and visual improvements.

## Content Wizard 1.0.1 - June 29, 2024

### Maven Publishing update

- Updated the pom files to support Maven Publishing through Sonatype.
- This version is correctly published to Maven Central.

## Content Wizard 1.0.0 - June 29, 2024

### Soft Release of basic Query abilities

- Query Wizard: Form-driven QueryBuilder statement builder
- Query IDE: Customized and extended GraphiQL IDE to support other Query Languages
- Results: Basic paginated Data Table for results display.

Note: this release has a package on Maven Central, but it isn't ideal. Technically still deployable/functional, but there are mistakes in the pom definitions.
