import {
  faArrowDown, faCheckCircle,
  faCopy,
  faLink
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Jump from "react-reveal/Jump";

interface OutputCardProps {
  shortenedUrl: string;
  url: string;
  showOutput: boolean;
  fullShortenedUrl: string;
  refreshStates: () => void;
}

export default function OutputCard(props: OutputCardProps) {
  const { shortenedUrl, url, showOutput, refreshStates, fullShortenedUrl } = props;
  const [copied, setCopied] = useState<boolean>(false);

  return (
    <Jump top when={showOutput}>
      {showOutput && (
        <div
          style={{ zIndex: 1 }}
          className="output-container position-absolute w-100"
        >
          <div className="h-100 w-100 d-flex align-items-center justify-content-center flex-column shadow rounded">
              <div className="output-container-header input-card py-2 d-flex justify-content-center">
                <span>
                  <FontAwesomeIcon className="me-2" icon={faCheckCircle} />
                  Success
                </span>
              </div>

            <div className="input-card py-2">
              <Form.Label className="w-100 justify-content-start">
                <span>
                  <FontAwesomeIcon className="me-1" icon={faLink} />
                  Your Original URL
                </span>
              </Form.Label>
              <InputGroup className="w-100">
                <Form.Control
                  className="text-box"
                  value={url}
                  type="url"
                  readOnly
                  disabled
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
                  <Button variant="primary">
                    <FontAwesomeIcon icon={faCopy} />
                  </Button>
                </CopyToClipboard>
              </InputGroup>
            </div>

            <div className="input-card output-container-header d-flex justify-content-center py-2">
              <FontAwesomeIcon className="me-1" icon={faArrowDown}/>
            </div>

            <div className="input-card py-2">
              <Form.Label className="w-100 justify-content-start">
                <span>
                  <FontAwesomeIcon className="me-1" icon={faLink} />
                  Generated URL
                </span>
              </Form.Label>
              <InputGroup className="w-100">
                <InputGroup.Text>
                  <span>short.ly/</span>
                </InputGroup.Text>
                <Form.Control
                  className="text-box"
                  value={shortenedUrl}
                  type="url"
                  readOnly
                />
                <CopyToClipboard
                  text={fullShortenedUrl}
                  onCopy={() => {
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 3000);
                  }}
                >
                  <Button variant="primary">
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
                variant="primary"
                className="me-2"
                onClick={(e) => {
                  refreshStates();
                }}
              >
                <span>Generate another link</span>
              </Button>
              <Button variant="primary" target="_blank" href={fullShortenedUrl}>
                <span>Goto Link</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Jump>
  );
}
