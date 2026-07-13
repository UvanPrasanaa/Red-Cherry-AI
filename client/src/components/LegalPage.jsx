import { LEGAL_DOCS } from '../data/legalContent';

export default function LegalPage({ docKey, onClose }) {
  const doc = LEGAL_DOCS[docKey];
  if (!doc) return null;

  return (
    <div className="overlay-page" role="dialog" aria-modal="true" aria-label={doc.title}>
      <div className="overlay-page__header">
        <button type="button" className="overlay-page__back" onClick={onClose} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="overlay-page__title">{doc.title}</div>
      </div>
      <div className="overlay-page__body">
        <div className="legal-doc">
          {doc.effectiveDate && <p className="legal-doc__effective">Effective Date: {doc.effectiveDate}</p>}
          {doc.intro && <p>{doc.intro}</p>}
          {doc.sections.map((section) => (
            <section key={section.heading} className="legal-doc__section">
              <h3>{section.heading}</h3>
              {section.body && <p>{section.body}</p>}
              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          {doc.closing && <p className="legal-doc__closing">{doc.closing}</p>}
        </div>
      </div>
    </div>
  );
}
