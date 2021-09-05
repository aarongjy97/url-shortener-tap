import React from "react";
import { Col, Container } from "react-bootstrap";
import Typed from "react-typed";
import InputOutputWrapper from "../components/InputOutputWrapper";
import "./UrlShortener.css";

export default function UrlShortener() {
  return (
    <section className="url-shortener h-100 w-100">
      <Container className="d-flex h-100 w-100 flex-row flex-wrap align-items-center justify-content-center">
        <Col
          xs={12}
          md={6}
          lg={6}
          className="typed-text-container d-flex justify-content-center align-items-center"
        >
          <Typed
            className="typed"
            strings={["URL Shortener", "short.ly"]}
            typeSpeed={40}
            backSpeed={30}
            backDelay={2000}
            loop={true}
          ></Typed>
        </Col>
        <InputOutputWrapper/>
      </Container>
    </section>
  );
}
