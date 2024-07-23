import { Link } from '@mui/material';
import { ScrollLink } from '../components';
import { aemToolsNav } from '../images';
import { styled } from '@mui/material/styles';
import { ReactNode } from 'react';

const StyledImage = styled('img')(({ theme }) => ({
  objectFit: 'contain',
  height: 'calc(.6 * 100vw)',
  [theme.breakpoints.up('lg')]: {
    height: 700,
  },
}));
type QuestionAnswer = {
  question: ReactNode | string;
  answer: ReactNode | string;
  image?: ReactNode;
};

const qbUrl =
  'https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/full-stack/search/query-builder-api';

export const questionsAndAnswers: QuestionAnswer[] = [
  {
    question: 'What is the Content Wizard?',
    answer: (
      <p>
        It's an easily installable tool for Adobe Experience Manager(AEM) environments, that enables Authors and
        Developers to build search queries for AEM content, run the queries, and explore/export the results.
      </p>
    ),
  },
  {
    question: 'What does this tool provide that Adobe Experience Manager(AEM) or other tools do not provide?',
    answer: (
      <>
        <p>
          All of the Content Wizard's functionality is based on AEM's exposed Query endpoints and AEM's native support
          of 5 different Query languages (QueryBuilder, SQL, JCR SQL2, XPATH, GraphQL).
        </p>
        <p>
          The Content Wizard's main goal is to make the use of those endpoints more accessible and convenient, by giving
          users:
        </p>
        <ul>
          <li>
            An easy form-based approach to building complex{' '}
            <Link href={qbUrl} target="_blank" rel="noreferrer" title="AEM QueryBuilder Documentation link">
              QueryBuilder
            </Link>{' '}
            statements.
          </li>
          <li>
            An integrated development environment (IDE) that features syntax highlighting, query history, multiple
            editing tabs, or support for all of AEM's out of the box Query Languages.
          </li>
          <li>
            A quick and convenient way to explore results, along with quick links that can open different AEM Authoring
            views for the selected content result.
          </li>
          <li>
            A simple way to export the results to CSV. AEM doesn't have this feature, but other tools do support CSV
            exports.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: 'What are some use cases for this tool?',
    answer: (
      <ul>
        <li>
          Use the tool for educational or development purposes to help you learn/discover ways to search for content in
          AEM.
        </li>
        <li>
          Perform content Audits and search for specific content criteria to build a report of the results and share
          with your team.
        </li>
        <li>
          Empower your Authors by giving them access to functionality that is typically reserved for developers and
          system administrators.
        </li>
      </ul>
    ),
  },
  {
    question: 'Are there any Requirements to be able to use this tool?',
    answer: (
      <>
        <p>You need to have administrative access to an AEM Authoring environment and/or build pipelines or scripts.</p>
        <p>
          Other than that, there are no additional requirements. The installation package does not require any other
          libraries to be installed.
        </p>
        <p>
          You should be able to install this on legacy environments as well (below AEM 6.5), but you will not be able to
          use the GraphQL features, as those were not supported by AEM until after AEM 6.5.
        </p>
      </>
    ),
  },
  {
    question: "How do I reset the Dark/Light mode theme to respect my Browser's default settings?",
    answer: (
      <p>
        Inside the Query IDE view, there is a settings gear icon in the bottom left corner that opens a Settings Dialog.
        This Dialog has a Theme switch that lets you revert back to system default.
      </p>
    ),
  },
  {
    question: "How come I can't open the Results view?",
    answer: (
      <p>
        That's because there are no Results to view. If you executed a Query, it either failed to execute or did not
        return any Results.
      </p>
    ),
  },
  {
    question: 'Can I install the Content Wizard anywhere?',
    answer: (
      <p>
        No, the Content Wizard can only be installed on AEM Environments, as a CRX Package. If your environment is an
        AEM Cloud environment, you can only install the package as part of a build deployment. If you're on a classic
        (AEM 6.5+) environment, you can easily install the latest release from Github, directly into your environment's
        Package Manager. See the <ScrollLink scrollId={'installation'}>Installation Guide</ScrollLink> for more details.
      </p>
    ),
  },
  {
    question: 'Is there a warranty?',
    answer: (
      <p>
        No, this is a use at your own risk tool. It comes with no warranties, but please feel free to open an Issue on
        the Github project. This tool does not perform create, updated, or delete operations against AEM, only search
        related Queries using AEM's out of the box APIs.
      </p>
    ),
  },
  {
    question: 'How do I access Content Wizard within AEM?',
    answer: (
      <p>
        The Content Wizard is conveniently located in the native AEM Tools navigation. Simply go to the AEM Home Page
        and click on the Tools Icon. From there you will see a Wizardry Tools tab, which contains a linked card to the
        Content Wizard.
      </p>
    ),
    image: <StyledImage src={aemToolsNav} alt="AEM Tools Navigation screen with Wizardry Tools tab open." />,
  },
  {
    question: 'Does the Content Wizard only search for and display results?',
    answer: (
      <>
        <p>
          It's much more than just that, but in simple terms, yes, that is likely the primary usage of the tool
          currently.
        </p>
        <p>
          There are future features coming that will expand upon this, such as Content Package exports, Bulk Workflows,
          and Bulk Editing capabilities!
        </p>
      </>
    ),
  },
  {
    question: 'How can I contribute?',
    answer: (
      <>
        <p>
          Contributor integration isn't 100% setup yet, but you can still fork the GitHub repository and make your
          updates there. Then open a PullRequest from your forked repository into the main Content Wizard repository and
          mention @drj101687 (Darrin Johnson) for a review.
        </p>
        <p>Contributor contributions will be stated in the project documentation.</p>
      </>
    ),
  },
  {
    question: 'When I export results as XLS, why do I see a warning when opening in Excel?',
    answer: (
      <p>
        This is because the tool exports 'XLS' results as an HTML table, and the metadata doesn't match what Excel
        expects for an XLS file. The file is safe to open in Excel, and will look slightly different than a CSV file
        opened in Excel. CSV is the default export type.
      </p>
    ),
  },
];
