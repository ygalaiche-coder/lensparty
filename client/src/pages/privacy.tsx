import LegalPage from "@/components/legal-page";

const tocItems = [
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "photo-video-data", title: "Photo & Video Data" },
  { id: "data-sharing", title: "Data Sharing" },
  { id: "data-storage", title: "Data Storage & Security" },
  { id: "cookies", title: "Cookies & Tracking" },
  { id: "your-rights", title: "Your Rights" },
  { id: "data-retention", title: "Data Retention" },
  { id: "children", title: "Children's Privacy" },
  { id: "international", title: "International Transfers" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate="April 21, 2026"
      tocItems={tocItems}
    >
      <p>
        LensParty ("we," "us," or "our") operates the LensParty platform at lensparty.com — a collaborative
        photo and video sharing service for events. This Privacy Policy explains how we collect, use, disclose,
        and safeguard your information when you use our website and services.
      </p>
      <p>
        By using LensParty, you agree to the collection and use of information in accordance with this policy.
        If you do not agree, please do not use our services.
      </p>

      <h2 id="information-we-collect">1. Information We Collect</h2>

      <h3>Account Information</h3>
      <p>When you create a LensParty account, we collect:</p>
      <ul>
        <li><strong>Email address</strong> — used for authentication, account recovery, and service communications</li>
        <li><strong>Full name</strong> — displayed within your account and to event participants</li>
        <li><strong>Password</strong> — stored as a secure bcrypt hash; we never store or have access to your plaintext password</li>
      </ul>

      <h3>Event Information</h3>
      <p>When you create an event, we collect:</p>
      <ul>
        <li>Event name and date</li>
        <li>Event access code (auto-generated)</li>
        <li>Plan type and subscription details</li>
        <li>Guestbook entries and messages submitted by guests</li>
      </ul>

      <h3>Payment Information</h3>
      <p>
        Payment processing is handled entirely by <strong>Stripe, Inc.</strong> We do not store your credit card number,
        CVV, or full card details on our servers. We receive and store only:
      </p>
      <ul>
        <li>Stripe customer ID and payment intent ID</li>
        <li>Plan type and amount paid</li>
        <li>Transaction timestamps</li>
      </ul>

      <h3>Automatically Collected Information</h3>
      <p>When you access LensParty, we may automatically collect:</p>
      <ul>
        <li>IP address and approximate location</li>
        <li>Browser type, version, and operating system</li>
        <li>Pages visited and time spent on the platform</li>
        <li>Referring URL and exit pages</li>
      </ul>

      <h2 id="how-we-use">2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li><strong>Provide and maintain the service</strong> — creating events, generating QR codes, hosting photo galleries</li>
        <li><strong>Process payments</strong> — upgrading event plans via Stripe</li>
        <li><strong>Authenticate users</strong> — managing login sessions via secure JWT tokens in httpOnly cookies</li>
        <li><strong>Send service communications</strong> — account confirmations, security alerts, and plan-related updates</li>
        <li><strong>Improve the platform</strong> — analyzing usage patterns to enhance features and performance</li>
        <li><strong>Prevent abuse</strong> — detecting and blocking spam, unauthorized access, and fraudulent activity</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal information. We do <strong>not</strong> use your photos or
        videos to train machine learning models.
      </p>

      <h2 id="photo-video-data">3. Photo & Video Data</h2>
      <p>
        Photos and videos are the core of the LensParty service. Here is how we handle this content:
      </p>
      <ul>
        <li><strong>Upload & Storage</strong> — Photos and videos uploaded by guests are stored in Cloudflare R2,
          a secure object storage service. Each file is associated with a specific event.</li>
        <li><strong>Access Control</strong> — Only the event creator (authenticated owner) has full management access
          to event media. Guests with the event access code can upload to and view the event gallery.</li>
        <li><strong>No Public Indexing</strong> — Event galleries are not indexed by search engines. Access requires
          the unique event code or authenticated owner access.</li>
        <li><strong>EXIF Data</strong> — We do not strip or process EXIF metadata from uploaded photos. Uploaded
          files are stored as-is.</li>
        <li><strong>Deletion</strong> — When an event owner deletes a photo, video, or entire event, the associated
          files are permanently removed from our storage within 30 days.</li>
      </ul>

      <h2 id="data-sharing">4. Data Sharing & Third Parties</h2>
      <p>We share your information only with the following third-party services, strictly as needed to operate LensParty:</p>
      <ul>
        <li><strong>Stripe, Inc.</strong> — Payment processing. Stripe's privacy policy applies to payment data:
          {" "}<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></li>
        <li><strong>Cloudflare, Inc.</strong> — File storage (R2) and content delivery. Cloudflare's privacy policy:
          {" "}<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a></li>
        <li><strong>Neon (Neon Tech, Inc.)</strong> — Database hosting (PostgreSQL). Neon's privacy policy:
          {" "}<a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener noreferrer">neon.tech/privacy-policy</a></li>
      </ul>
      <p>We may also disclose your information if required by law, court order, or governmental request.</p>

      <h2 id="data-storage">5. Data Storage & Security</h2>
      <p>We implement industry-standard security measures to protect your data:</p>
      <ul>
        <li><strong>Encryption in transit</strong> — All data transmitted between your browser and our servers is encrypted via HTTPS/TLS</li>
        <li><strong>Password hashing</strong> — Passwords are hashed using bcrypt with salt rounds before storage</li>
        <li><strong>Secure authentication</strong> — Sessions are managed via JWT tokens stored in httpOnly, secure cookies, preventing XSS-based token theft</li>
        <li><strong>Access controls</strong> — Role-based access ensures only authorized users can manage events and access admin functionality</li>
        <li><strong>Infrastructure security</strong> — Our database and storage infrastructure providers (Neon, Cloudflare) maintain SOC 2 compliance and encryption at rest</li>
      </ul>
      <p>
        While we strive to protect your data, no method of electronic transmission or storage is 100% secure.
        We cannot guarantee absolute security.
      </p>

      <h2 id="cookies">6. Cookies & Tracking</h2>
      <p>LensParty uses the following cookies:</p>
      <ul>
        <li><strong>Authentication cookie</strong> (<code>token</code>) — An httpOnly, secure cookie containing your
          JWT session token. Essential for keeping you logged in. Expires after 7 days.</li>
        <li><strong>Language preference</strong> — Stored in localStorage (not a cookie) to remember your selected
          language across visits.</li>
        <li><strong>Theme preference</strong> — Stored in localStorage to remember your light/dark mode choice.</li>
      </ul>
      <p>
        We do <strong>not</strong> use third-party tracking cookies, advertising cookies, or analytics services
        that track you across websites.
      </p>

      <h2 id="your-rights">7. Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
      <ul>
        <li><strong>Access</strong> — Request a copy of the personal data we hold about you</li>
        <li><strong>Correction</strong> — Request correction of inaccurate personal data</li>
        <li><strong>Deletion</strong> — Request deletion of your personal data and account</li>
        <li><strong>Data Portability</strong> — Request your data in a structured, machine-readable format</li>
        <li><strong>Withdraw Consent</strong> — Where processing is based on consent, you may withdraw it at any time</li>
        <li><strong>Object</strong> — Object to processing of your personal data for certain purposes</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:support@lensparty.com">support@lensparty.com</a>. We will respond within 30 days.
      </p>

      <h3>For EU/EEA Residents (GDPR)</h3>
      <p>
        If you are located in the European Union or European Economic Area, you have additional rights under the
        General Data Protection Regulation. Our legal basis for processing your data is: (a) performance of a
        contract (providing the service you signed up for), (b) legitimate interests (improving our service,
        preventing fraud), and (c) your consent (where applicable). You have the right to lodge a complaint
        with your local data protection authority.
      </p>

      <h3>For California Residents (CCPA)</h3>
      <p>
        California residents have the right to know what personal information is collected, request deletion,
        and opt out of the sale of personal information. LensParty does not sell personal information.
      </p>

      <h2 id="data-retention">8. Data Retention</h2>
      <p>We retain your data for as long as your account is active or as needed to provide the service:</p>
      <ul>
        <li><strong>Account data</strong> — Retained until you delete your account</li>
        <li><strong>Event data and media</strong> — Retained until the event owner deletes the event or their account</li>
        <li><strong>Payment records</strong> — Retained for 7 years for tax and legal compliance</li>
        <li><strong>Server logs</strong> — Automatically purged after 90 days</li>
      </ul>
      <p>
        Upon account deletion, we will remove your personal data within 30 days, except where retention is
        required by law.
      </p>

      <h2 id="children">9. Children's Privacy</h2>
      <p>
        LensParty is not intended for use by children under the age of 16. We do not knowingly collect personal
        information from children under 16. If we become aware that we have collected data from a child under 16,
        we will take steps to delete that information promptly. If you believe a child under 16 has provided us
        with personal data, please contact us at{" "}
        <a href="mailto:support@lensparty.com">support@lensparty.com</a>.
      </p>

      <h2 id="international">10. International Data Transfers</h2>
      <p>
        LensParty's servers and third-party service providers may be located in countries outside your country of
        residence. By using LensParty, you consent to the transfer of your information to these countries, which
        may have different data protection laws than your jurisdiction. We ensure appropriate safeguards are in
        place for international transfers, including standard contractual clauses where required.
      </p>

      <h2 id="changes">11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices or legal
        requirements. We will notify you of significant changes by posting the updated policy on this page
        with a new effective date. For material changes, we may also notify you via email. Your continued use
        of LensParty after changes take effect constitutes acceptance of the updated policy.
      </p>

      <h2 id="contact">12. Contact Us</h2>
      <p>If you have questions or concerns about this Privacy Policy or our data practices, contact us:</p>
      <ul>
        <li><strong>Company</strong>: LensParty</li>
        <li><strong>Email</strong>: <a href="mailto:support@lensparty.com">support@lensparty.com</a></li>
      </ul>
    </LegalPage>
  );
}
