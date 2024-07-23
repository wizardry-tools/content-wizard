import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import MarkdownContainer from './MarkdownContainer';
import { useReleaseInfoContext, REPO, DEFAULT_RELEASE_URL } from 'src/providers';

export const InstallationGuide = () => {
  const [content, setContent] = useState('');
  const { name, url } = useReleaseInfoContext();

  useEffect(() => {
    fetch('/docs/Installation.md')
      .then((res) => res.text())
      .then((res) => {
        setContent(res);
      })
      .catch((err) => console.log(err));
  }, []);

  const modifiedContent = useMemo(() => {
    if (content && name && url) {
      let modifiedContent = content;
      if (url) {
        modifiedContent = modifiedContent.replace('{releaseUrl}', url);
      } else {
        modifiedContent = modifiedContent.replace('{releaseUrl}', DEFAULT_RELEASE_URL);
      }
      if (name) {
        const version = name.replace(`${REPO}-`, '');
        if (version) {
          return modifiedContent.replace('{releaseVersion}', version);
        }
      }
      // if we haven't returned yet, set the version to generic format
      return modifiedContent.replace('{releaseVersion}', '#.#.#');
    }
  }, [content, name, url]);

  return (
    <Box
      id="installation"
      sx={{
        pt: { xs: 4, sm: 8 },
        pb: { xs: 8, sm: 12 },
      }}
    >
      <MarkdownContainer>{modifiedContent}</MarkdownContainer>
    </Box>
  );
};
