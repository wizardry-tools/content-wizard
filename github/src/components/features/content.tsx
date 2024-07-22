import FindInPageIcon from '@mui/icons-material/FindInPage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TranslateIcon from '@mui/icons-material/Translate';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DataObjectIcon from '@mui/icons-material/DataObject';
import InsightsIcon from '@mui/icons-material/Insights';
import HistoryIcon from '@mui/icons-material/History';
import WidgetsIcon from '@mui/icons-material/Widgets';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExploreIcon from '@mui/icons-material/Explore';

import {
  qwTargetingLight,
  qwTargetingDark,
  qwAuthoringLight,
  qwAuthoringDark,
  qwReplicationLight,
  qwReplicationDark,
  qwMsmLight,
  qwMsmDark,
  qwTranslationLight,
  qwTranslationDark,
  ideDark,
  ideLight,
  ideLanguageDark,
  ideLanguageLight,
  ideGraphqlDark,
  ideGraphqlLight,
  ideHistoryDark,
  ideHistoryLight,
  resultsImageDark,
  resultsImageLight,
  resultsExplorerImageDark,
  resultsExplorerImageLight,
  resultsExporterImageDark,
  resultsExporterImageLight,
  resultsFilterSortImageDark,
  resultsFilterSortImageLight,
  resultsBuilderImageDark,
  resultsBuilderImageLight,
} from 'src/images';
import { CodeIcon } from 'src/icons';
import { SvgIcon } from '@mui/material';

export const queryWizardFeatures = [
  {
    icon: <FindInPageIcon />,
    title: 'Targeting Rules',
    description:
      'Standard and required query rules that tell AEM where you want to look, what you want to find, and how max results to return.',
    imageLight: qwTargetingLight,
    imageDark: qwTargetingDark,
  },
  {
    icon: <ManageAccountsIcon />,
    title: 'Authoring Rules',
    description:
      'Rules that filter the targeted results based on recorded authoring activity, such as filtering based on the user who authored or the date on which the activity took place.',
    imageLight: qwAuthoringLight,
    imageDark: qwAuthoringDark,
  },
  {
    icon: <PublishedWithChangesIcon />,
    title: 'Replication Rules',
    description: 'Similar to the Authoring Rules, except these rules are focused around Replication status and events',
    imageLight: qwReplicationLight,
    imageDark: qwReplicationDark,
  },
  {
    icon: <AccountTreeIcon />,
    title: 'MSM(Multi Site Manager) Rules',
    description:
      'With the MSM Rules, you will be able to filter the results based on MSM status and activity. Find your content that has been suspended, rolled out, or has local deletions.',
    imageLight: qwMsmLight,
    imageDark: qwMsmDark,
  },
  {
    icon: <TranslateIcon />,
    title: 'Translation Rules',
    description:
      'Use Translation based rules to filter results based on if they are a Language Copy, what language they have, and whether or not the Translation has been approved the in AEM.',
    imageLight: qwTranslationLight,
    imageDark: qwTranslationDark,
  },
];

export const ideFeatures = [
  {
    icon: <DataObjectIcon />,
    title: 'Raw Results',
    description: 'Build and run queries directly in the IDE. Review the raw results in a resizable window.',
    imageLight: ideLight,
    imageDark: ideDark,
  },
  {
    icon: (
      <SvgIcon
        component={CodeIcon}
        className="query-ide-icon"
        inheritViewBox
        sx={{
          fontSize: '1.5rem',
        }}
      />
    ),
    title: 'Language Select',
    description:
      'Pick from 5 out of the box query languages. Existing GraphQL support from GrapiQL IDE, extended for SQL, JCR SQL2, QueryBuilder, and XPATH',
    imageDark: ideLanguageDark,
    imageLight: ideLanguageLight,
  },
  {
    icon: <InsightsIcon />,
    title: 'GraphiQL IDE',
    description:
      'Retaining out of the box GraphiQL functionality, the Query IDE can provide rich contextual support for GraphQL using the Document Explorer plugin.',
    imageDark: ideGraphqlDark,
    imageLight: ideGraphqlLight,
  },
  {
    icon: <HistoryIcon />,
    title: 'Query History & Favorites',
    description:
      'Any unique query statement that is run within the IDE will automatically be remembered for future use. Relabel and/or favorite the queries used frequently.',
    imageDark: ideHistoryDark,
    imageLight: ideHistoryLight,
  },
];

export const resultsFeatures = [
  {
    icon: <FindInPageIcon />,
    title: 'Results Table',
    description:
      'Results for SQL, JCR SQL2, QueryBuilder, and XPATH will be loaded into the Results Table for exploring or exporting.',
    imageDark: resultsImageDark,
    imageLight: resultsImageLight,
  },
  {
    icon: <ExploreIcon />,
    title: 'Explore Results',
    description:
      'Explore the JSON of each result. Easily review or copy the JSON of an individual result, along with convenient links to open the content in AEM.',
    imageDark: resultsExplorerImageDark,
    imageLight: resultsExplorerImageLight,
  },
  {
    icon: <FilterListIcon />,
    title: 'Filter and Sort',
    description: 'Sort and filter the results table, making it easier to pin-point and confirm content values.',
    imageDark: resultsFilterSortImageDark,
    imageLight: resultsFilterSortImageLight,
  },
  {
    icon: <FileDownloadIcon />,
    title: 'Export Results',
    description: 'Export the results as CSV, JSON, XML, XSL(Excel), or HTML. Easily share the results with your team.',
    imageDark: resultsExporterImageDark,
    imageLight: resultsExporterImageLight,
  },
  {
    icon: <WidgetsIcon />,
    title: 'Export Package',
    description:
      'Create, Build, and Download an AEM content package of the results. Easily export the content for installation into another environment. Also serves as a convenient way to create targeted content backups.',
    imageDark: resultsBuilderImageDark,
    imageLight: resultsBuilderImageLight,
  },
];
