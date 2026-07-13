// Structured legal / policy content rendered by <LegalPage />.
// Each doc is a list of sections: { heading, body?, list? }.
// Keeping this as data (not hard-coded JSX) makes it trivial to update
// the wording later without touching any component code.

export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  effectiveDate: 'July 12, 2026',
  intro:
    'Welcome to RedCherry AI ("we," "our," or "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use RedCherry AI through our website at www.redcherryai.site.',
  sections: [
    {
      heading: 'Information We Collect',
      body: 'We may collect:',
      list: [
        'Name (if provided)',
        'Email address (if you create an account)',
        'Messages and prompts you submit to the AI',
        'Device information (browser, operating system, IP address)',
        'Cookies and similar technologies',
        'Usage and analytics data',
      ],
    },
    {
      heading: 'How We Use Your Information',
      body: 'We use your information to:',
      list: [
        'Provide and improve our AI services',
        'Respond to your requests',
        'Maintain account security',
        'Prevent abuse, spam, and fraud',
        'Analyze performance and improve user experience',
        'Comply with legal obligations',
      ],
    },
    {
      heading: 'AI Responses',
      body: 'AI-generated content may be inaccurate, incomplete, or outdated. Users are responsible for verifying important information before relying on it.',
    },
    {
      heading: 'Data Security',
      body: 'We use reasonable technical and organizational measures to protect your information. However, no internet service is completely secure.',
    },
    {
      heading: "Children's Privacy",
      body: 'RedCherry AI is intended for users aged 13 years or older. We do not knowingly collect personal information from children under 13. If such information is discovered, it will be deleted as required by applicable law.',
    },
    {
      heading: 'Third-Party Services',
      body: 'Our services may use trusted third-party providers for hosting, authentication, analytics, or payment processing. These providers process information according to their own privacy policies.',
    },
    {
      heading: 'Cookies',
      body: 'We may use cookies to remember preferences, improve functionality, and analyze website usage.',
    },
    {
      heading: 'Your Rights',
      body: 'Depending on your location, you may have the right to:',
      list: [
        'Access your personal data',
        'Correct inaccurate information',
        'Request deletion of your data',
        'Object to certain data processing',
      ],
    },
    {
      heading: 'Changes to This Policy',
      body: 'We may update this Privacy Policy at any time. Updates become effective when published on this page.',
    },
    {
      heading: 'Contact',
      body: 'Website: www.redcherryai.site',
    },
  ],
  closing: 'By using RedCherry AI, you acknowledge that you have read and understood this Privacy Policy.',
};

export const TERMS_AND_CONDITIONS = {
  title: 'Terms and Conditions',
  effectiveDate: 'July 12, 2026',
  intro: 'Welcome to RedCherry AI. By accessing or using RedCherry AI, you agree to these Terms and Conditions.',
  sections: [
    {
      heading: 'Eligibility',
      body: 'You must be 13 years of age or older to use RedCherry AI.',
    },
    {
      heading: 'Acceptable Use',
      body: 'You agree not to:',
      list: [
        'Break any laws.',
        'Upload malware or harmful code.',
        'Attempt to hack, disrupt, or damage the service.',
        'Use the AI for fraud, scams, or impersonation.',
        'Generate or distribute illegal or harmful content.',
        'Violate the rights or privacy of others.',
      ],
    },
    {
      heading: 'AI Disclaimer',
      body: 'AI responses are generated automatically and may contain errors. They should not be considered professional legal, medical, financial, or emergency advice.',
    },
    {
      heading: 'User Content',
      body: 'You are responsible for the prompts and content you submit. You must have the necessary rights to any content you upload.',
    },
    {
      heading: 'Intellectual Property',
      body: 'RedCherry AI, its branding, design, and software are protected by applicable intellectual property laws. Users may not copy or redistribute the service without permission.',
    },
    {
      heading: 'Account Suspension',
      body: 'We may suspend or terminate accounts that violate these Terms or engage in abusive, illegal, or harmful behavior.',
    },
    {
      heading: 'Service Availability',
      body: 'We may modify, suspend, or discontinue any part of the service without prior notice.',
    },
    {
      heading: 'Limitation of Liability',
      body: 'To the maximum extent permitted by law, RedCherry AI is not responsible for any indirect, incidental, or consequential damages resulting from the use of the service.',
    },
    {
      heading: 'Changes',
      body: 'We may update these Terms at any time. Continued use of the service means you accept the updated Terms.',
    },
    {
      heading: 'Governing Law',
      body: 'These Terms are governed by the applicable laws of your jurisdiction unless otherwise required by law.',
    },
  ],
  closing: 'By using RedCherry AI, you agree to these Terms and Conditions.',
};

export const COMMUNITY_GUIDELINES = {
  title: 'Community Guidelines',
  intro: 'Our goal is to keep RedCherry AI safe, respectful, and useful for everyone.',
  sections: [
    {
      heading: 'Age Requirement',
      body: 'You must be 13 years or older to use RedCherry AI.',
    },
    {
      heading: 'Be Respectful',
      list: ['Treat others with kindness.', 'No harassment, bullying, or hate speech.', 'Respect different opinions.'],
    },
    {
      heading: 'Keep It Legal',
      body: 'Do not use RedCherry AI for:',
      list: ['Illegal activities', 'Fraud or scams', 'Identity theft or impersonation', 'Hacking or cybercrime', 'Copyright infringement'],
    },
    {
      heading: 'No Harmful Content',
      body: 'Do not create or share content involving:',
      list: [
        'Violence or threats',
        'Child exploitation',
        'Terrorism or extremism',
        'Dangerous or illegal instructions',
        'Sexually explicit content involving minors',
      ],
    },
    {
      heading: 'Protect Privacy',
      body: 'Do not share personal information belonging to yourself or others without permission.',
    },
    {
      heading: 'AI Responsibility',
      body: 'Always verify important AI-generated information before making important decisions.',
    },
    {
      heading: 'Reporting Abuse',
      body: 'If you discover abusive behavior or harmful content, report it through our support channels.',
    },
    {
      heading: 'Enforcement',
      body: 'Violations may result in:',
      list: ['Content removal', 'Temporary suspension', 'Permanent account termination', 'Reporting to appropriate authorities when legally required'],
    },
  ],
  closing: 'Thank you for helping make RedCherry AI a safe and welcoming community.',
};

export const LEGAL_DOCS = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_AND_CONDITIONS,
  community: COMMUNITY_GUIDELINES,
};
