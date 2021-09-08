import axios from "axios";
import React, { useState } from "react";
import { Col } from "react-bootstrap";
import { generateURLSql } from "../api/Api";
import InputCard from "./InputCard";
import OutputCard from "./OutputCard";

export default function InputOutputWrapper() {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [url, setUrl] = useState<string>("");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [shortenedUrl, setShortenedUrl] = useState<string>("");
  const [fullShortenedUrl, setFullShortenedUrl] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setIsInvalid(false);
    setErrorMessage("");

    try {
      const urlResponse = await generateURLSql(url, customUrl);
      setShortenedUrl(urlResponse.shortenedUrl);
      setFullShortenedUrl(urlResponse.fullShortenedUrl);
      setShowOutput(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response);
        setErrorMessage(error.response?.data);
        setIsInvalid(true);
      }
    } finally {
      setSubmitted(false);
    }
  }

  function refreshErrors() {
    if (isInvalid) {
      setErrorMessage("");
      setIsInvalid(false);
    }
  }

  function refreshStates() {
    setSubmitted(false);
    setErrorMessage('');
    setIsInvalid(false);
    setShowOutput(false);
    setUrl("");
    setCustomUrl("");
    setShortenedUrl("");
  }

  return (
    <Col
      xs={12}
      md={6}
      lg={6}
      className="d-flex align-items-center justify-content-center"
    >
      <OutputCard
        shortenedUrl={shortenedUrl}
        fullShortenedUrl={fullShortenedUrl}
        url={url}
        showOutput={showOutput}
        refreshStates={refreshStates}
      />

      <InputCard
        handleSubmit={handleSubmit}
        isInvalid={isInvalid}
        submitted={submitted}
        url={url}
        setUrl={setUrl}
        customUrl={customUrl}
        setCustomUrl={setCustomUrl}
        errorMessage={errorMessage}
        refreshErrors={refreshErrors}
      />
    </Col>
  );
}
