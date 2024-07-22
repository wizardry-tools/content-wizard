import FindInPageIcon from '@mui/icons-material/FindInPage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TranslateIcon from '@mui/icons-material/Translate';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
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
} from 'src/images';

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
