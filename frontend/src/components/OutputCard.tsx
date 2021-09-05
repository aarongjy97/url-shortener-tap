import { faCopy, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Fade from "react-reveal/Fade";

interface OutputCardProps {
  shortenedUrl: string;
  url: string;
  showOutput: boolean;
  refreshStates: () => void;
}

export default function OutputCard(props: OutputCardProps) {
  const { shortenedUrl, url, showOutput, refreshStates } = props;
  const [copied, setCopied] = useState<boolean>(false);

  return (
    <Fade top when={showOutput}>
      {showOutput && (
        <div
          style={{ zIndex: 1 }}
          className="input-container position-absolute w-100"
        >
          <div className="h-100 w-100 d-flex align-items-center justify-content-center flex-column bg-white shadow rounded">
            <div className="input-card py-2">
              <Form.Label className="w-100 justify-content-start">
                <span>
                  <FontAwesomeIcon className="me-1" icon={faLink} />
                  Original URL
                </span>
              </Form.Label>
              <InputGroup className="w-100">
                <Form.Control
                  className="text-box"
                  value={url}
                  type="url"
                  readOnly
                />
                <CopyToClipboard
                  text={url}
                  onCopy={() => {
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 3000);
                  }}
                >
                  <Button variant="success">
                    <FontAwesomeIcon icon={faCopy} />
                  </Button>
                </CopyToClipboard>
              </InputGroup>
            </div>

            <div className="input-card py-2">
              <Form.Label className="w-100 justify-content-start">
                <span>
                  <FontAwesomeIcon className="me-1" icon={faLink} />
                  Generated URL
                </span>
              </Form.Label>
              <InputGroup className="w-100">
                <Form.Control
                  className="text-box"
                  value={shortenedUrl}
                  type="url"
                  readOnly
                />
                <CopyToClipboard
                  text={shortenedUrl}
                  onCopy={() => {
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 3000);
                  }}
                >
                  <Button variant="success">
                    <FontAwesomeIcon icon={faCopy} />
                  </Button>
                </CopyToClipboard>
              </InputGroup>
            </div>

            {copied && (
              <div className="input-card py-2">
                <span>Copied to clipboard!</span>
              </div>
            )}

            <div className="input-card py-2 d-flex justify-content-center flex-row align-items-center">
              <Button
                variant="success"
                onClick={(e) => {
                  refreshStates();
                }}
              >
                <span>Generate another link</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Fade>
  );
}
