import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import IosShareIcon from '@mui/icons-material/IosShare';
import HighlightIcon from '@mui/icons-material/Highlight';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const highlightItems = [
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Build Queries with Ease',
    description:
      "Whether you're new to AEM or an experienced developer, the Content Wizard's tools enable you to build powerful query statements that are supported by AEM's out of the box query languages.",
  },
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Persisted Settings',
    description:
      'The Query IDE supports persisted settings and can remember dark/light mode preference along with previous query statements and GraphQL headers/variables.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Precision Results',
    description:
      'Fine-tune your QueryBuilder Statements in the Query IDE after using the Query Wizard, to maximize the accuracy of your results.',
  },
  {
    icon: <IosShareIcon />,
    title: 'Export Query, Results, and Content',
    description:
      'Conveniently copy query statements to clipboard. Download results as a sharable data file. Extract the content of results as an AEM content package zip.',
  },
  {
    icon: <HighlightIcon />,
    title: 'Syntax Highlighting',
    description:
      'Each supported language features syntax highlighting that is tuned to the dark/light mode themes, making query statements easier to read.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Great user experience',
    description:
      "Seamlessly navigate between Content Wizard's different views. Swap between Query Wizard and Query IDE when building QueryBuilder statements. Exposing powerful content features that are easy to use.",
  },
];

export const highlightContent = {
  heading: 'Highlights',
  subHeading:
    'Explore why Content Wizard can help your Developers and Authors find AEM content issues without wasting time browsing for them.',
  items: highlightItems,
};
