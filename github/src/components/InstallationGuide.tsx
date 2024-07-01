import {Box} from "@mui/material";
import {useEffect, useState} from "react";
import MarkdownContainer from "./MarkdownContainer";

export const InstallationGuide = () => {

  const [content, setContent] = useState('');

  useEffect(()=>{
    fetch('/docs/Installation.md')
      .then(res => res.text())
      .then(res => setContent(res))
      .catch(err => console.log(err));
  });

  return (
    <Box
      id="installation"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
      }}
    >
      <MarkdownContainer>
        {content}
      </MarkdownContainer>
    </Box>
  )
}