# Installation Guide

There are a few different ways to install Content Wizard. Local build and deploy, CI/CD integration with Maven, or direct download and install.


## Direct Installation

This is the simplest and most direct choice, especially if your intent is to only install locally for your own development or learning needs.

Head over to the [Content Wizard Releases](https://github.com/wizardry-tools/content-wizard/releases) page on [Github](https://github.com/wizardry-tools/content-wizard) and download the latest version of `content-wizard.all` zip and then directly install it on your desired AEM environment using CRX PackageManager (/crx/packmgr/index.jsp).


## Build Integration

This option is useful if you want to include Content Wizard automatically with your build. This is mainly intended for remote environments that potentially have security/access limitations where CRX PackageManager is not viable. This option is required if you wish to deploy Content Wizard to a non-RDE AEMaaCS environment.

You need to list the Content Wizard "All" module's zip as a dependency within your project. Either within your root pom.xml or the pom.xml of your own deployed module (eg: your-project.all/pom.xml).

```xml
<dependency>
    <groupId>com.wizardry-tools</groupId>
    <artifactId>content-wizard.all</artifactId>
    <version>1.1.2</version>
    <type>zip</type>
</dependency>
```

If you defined the dependency with version in your root pom.xml, you will also need to re-define it as a non-versioned dependency within your deployment module pom.xml.

Assuming you have an AEM archetype templated project structure, you would use `your-project.all/pom.xml`.

```xml
<dependency>
    <groupId>com.wizardry-tools</groupId>
    <artifactId>content-wizard.all</artifactId>
    <type>zip</type>
</dependency>
```

Then inside your deployment module's `filevault-package-maven-plugin` build plugin definition, you would add a new embedded entry. Replacing `your-project` with the artifact ID of your own project.

```xml
<embedded>
    <groupId>com.wizardry-tools</groupId>
    <artifactId>content-wizard.all</artifactId>
    <type>zip</type>
    <target>/apps/your-project-vendor-packages/application/install</target>
</embedded>
```

The next build you run that compiles your deployment module will pull down the "All" zip for Content Wizard, of the version you specified, and embed it as a vendor package in your project's deployment package. 


## Local Compilation

As with any open-source project, you always have the ability to clone the repository yourself and follow the build instructions included in the project README. But to get you started, this is the command you would need to run to compile and install Content Wizard from the source code.

```shell
mvn clean install -P autoInstallSinglePackage
```

This will automatically setup a workspace copy of NodeJS 18 and compile the frontend, before building and deploying packages to AEM.

### Local FE Development

If you're looking to play around with the Frontend, you'll want to either manually define the AEM CORS Policy OSGI config to allow localhost:3000, or you can add an optional flag that deploys an already configured CORS policy.

```shell
mvn clean install -P autoInstallSinglePackage,localDev
```