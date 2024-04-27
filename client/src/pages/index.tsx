import Head from "next/";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { Container, Typography } from "@mui/material";

export default function Home() {
  return (
    <>
      <Container className="align-center">
        <Typography variant="h1" sx={{ mt: 20 }}>
          Canary
        </Typography>
        <Typography variant="h4">A modern web application template</Typography>
      </Container>
    </>
  );
}
