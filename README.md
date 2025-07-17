# react-application-page-sections

## Summary

[Link to article](https://michalkornet.com/2023/12/09/Custom_SharePoint_Section_Templates.html)

This feature has been developed in association with Olga Staszek-Kornet, the Microsoft 365 and Power Platform Consultant, and Project Coordinator in the Digital Workplace area—privately, my wife.

## Key features

### 1.Duplication of sections

Our solution facilitates recreating predefined section templates from two distinct sources:

- **Site-specific Section List:** Tailored by site owners and editors, allows for defining site-specific section templates that cater to the unique needs of individual teams or projects.
- **Global Section List:** Managed by administrators, this global list provides a centralized repository of sections for consistent use across the organization.

### 2. Efficient page creation

By enabling the quick insertion of pre-configured sections, our extension accelerates the page creation process. This not only saves time but also ensures consistency in the layout and structure of SharePoint pages, keeping it in line with the globally applied guidelines.

### 3. Systematized page development

The Section Templates lists serve as a reference point for building cohesive page structures based on repetitive section arrangements. This way, users can easily select and implement sections as major 'building blocks' on their page, simultaneously fostering a company-steered approach to consistent page development.

### 4. Easy way to copy web parts with specific configuration

The solution allows copying sections with embedded web parts, keeping their whole initial configuration. This feature is especially useful when users want to copy a web part with complex or time-consuming configuration, such as the Quick Links web part. Here, the whole configuration is saved in the code, and thus you can place the exact copy of some web part on another page by adding the whole copied section and removing the redundant parts.

### CoAuthoring remarks

The solution version 1.0.0.5 has been updated to SPFx 1.21.1 and includes fixes for page co-authoring.

The solution allows saving the page even when it is being edited by multiple users simultaneously. Unfortunately, due to certain limitations, after using the Add Section button, the page will reload in standard editing mode. This means that other editors will no longer be able to edit the page at the same time.

To continue editing the page in co-authoring mode, you need to save and edit the page again.


## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.18.2-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

To make use of the Global Section List, replace the 'globalSectionsUrl' paramenter in the ClientSideInstance.xml and elements.xml files with the URL where the global list has been established, replacing 'https://contoso.sharepoint.com'.

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| react-application-page-sections | Michał Kornet([@kornetmichal](https://x.com/kornetmichal)), [GitHub](https://github.com/mkm17) , [Blog](https://michalkornet.com), Olga Staszek-Kornet [LinkedIn](https://www.linkedin.com/in/olgastaszek-microsoft365/) |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.0.0.4 | December 10, 2023| Initial release |
| 1.0.0.5 | July 17, 2025   | Update version to SPFx 1.21.1, fixes for pageCoAuthoring|

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

> Include any additional steps as needed.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
