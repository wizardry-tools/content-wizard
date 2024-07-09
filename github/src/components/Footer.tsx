import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { GitHub } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useScrollToId } from "../utils/scroll";

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      {"Copyright © "}
      <Link href="https://wizardry-tools.com/">Content Wizard&nbsp;</Link>
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  const scrollToSection = useScrollToId();
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: "center", md: "left" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: { xs: "flex", sm: "flex" },
            justifyContent: "flex-end",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            Content Wizard
          </Typography>
          <Link
            color="text.secondary"
            variant="body2"
            onClick={() => scrollToSection.scroll("features")}
          >
            Features
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            onClick={() => scrollToSection.scroll("highlights")}
          >
            Highlights
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            onClick={() => scrollToSection.scroll("installation")}
          >
            Installation
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            onClick={() => scrollToSection.scroll("faw")}
          >
            FAQ
          </Link>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            flexDirection: "row",
            gap: 1,
          }}
        >
          <Copyright />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            flexDirection: "row",
            gap: 1,
          }}
        >
          <IconButton
            color="inherit"
            href="https://github.com/wizardry-tools/content-wizard"
            target="_blank"
            aria-label="Github"
            title="Get the code on Github!"
            sx={{
              height: "5rem",
              width: "5rem",
              margin: "auto",
            }}
          >
            <GitHub sx={{ height: "3rem", width: "3rem" }} />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
}
