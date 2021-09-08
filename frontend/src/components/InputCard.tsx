import { faLink, faMagic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, Form, Spinner } from "react-bootstrap";

interface InputCardProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isInvalid: boolean;
  submitted: boolean;
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  customUrl: string;
  setCustomUrl: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string;
  refreshErrors: () => void;
}

export default function InputCard(props: InputCardProps) {
  const {
    handleSubmit,
    isInvalid,
    submitted,
    url,
    setUrl,
    customUrl,
    setCustomUrl,
    errorMessage,
    refreshErrors
  } = props;

  return (
    <div className="input-container w-100 d-flex align-items-center justify-content-center flex-column bg-white shadow rounded">
      <Form noValidate className="input-card" onSubmit={(e) => handleSubmit(e)}>
        <Form.Group className="p-2">
          <Form.Label>
            <span>
              <FontAwesomeIcon className="me-1" icon={faLink} />
              Original URL
            </span>
          </Form.Label>
          <Form.Control
            className="text-box"
            value={url}
            type="url"
            placeholder="Shorten your link"
            isInvalid={isInvalid}
            onChange={(e) => {
              setUrl(e.target.value);
              refreshErrors();
            }}
          />
        </Form.Group>
        <Form.Group className="p-2">
          <Form.Label>
            <span>
              <FontAwesomeIcon className="me-1" icon={faMagic} />
              Custom URL
            </span>
          </Form.Label>
          <Form.Control
            className="text-box"
            value={customUrl}
            type="url"
            placeholder="Customise your link"
            isInvalid={isInvalid}
            onChange={(e) => {
              setCustomUrl(e.target.value);
              refreshErrors();
            }}
          />
          <Form.Control.Feedback type="invalid">
            <span>{errorMessage}</span>
          </Form.Control.Feedback>
        </Form.Group>
        <div className="pt-3 d-flex justify-content-center">
          <Button
            variant="primary"
            disabled={submitted || url.length < 1}
            type="submit"
          >
            {!submitted && <span>Generate</span>}
            {submitted && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
