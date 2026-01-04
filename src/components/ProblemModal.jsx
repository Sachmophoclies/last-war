import { useState } from "react";
import Modal from "./Modal";

const GITHUB_REPO = "https://github.com/Sachmophoclies/last-war";
const EMAIL = "Sachmophoclies@gmail.com";

export default function ProblemModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1 = "What's up?", 2 = "Contact me via:"
  const [issueType, setIssueType] = useState(null); // "enhancement" or "bug"

  const handleClose = () => {
    setStep(1);
    setIssueType(null);
    onClose();
  };

  const handleIssueTypeSelect = (type) => {
    setIssueType(type);
    setStep(2);
  };

  const handleGitHubClick = () => {
    // Use GitHub's template parameter to reference the issue templates
    const template = issueType === "enhancement" ? "enhancement.md" : "bugfix.md";
    const url = `${GITHUB_REPO}/issues/new?template=${template}`;
    window.open(url, "_blank", "noopener,noreferrer");
    handleClose();
  };

  const handleEmailClick = () => {
    const subject = issueType === "enhancement"
      ? "[Enhancement] Your request here"
      : "[Bugfix] Your issue here";

    const url = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
    window.location.href = url;
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? "What's up?" : "Contact me via:"}
    >
      {step === 1 && (
        <>
          <button
            className="modal-button"
            onClick={() => handleIssueTypeSelect("enhancement")}
          >
            I want something
          </button>
          <button
            className="modal-button"
            onClick={() => handleIssueTypeSelect("bug")}
          >
            Something is wrong
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <button
            className="modal-button"
            onClick={handleGitHubClick}
          >
            GitHub
          </button>
          <button
            className="modal-button"
            onClick={handleEmailClick}
          >
            Email
          </button>
        </>
      )}
    </Modal>
  );
}
