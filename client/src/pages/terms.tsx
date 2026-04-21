import LegalPage from "@/components/legal-page";

const tocItems = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "description", title: "Service Description" },
  { id: "accounts", title: "Accounts & Registration" },
  { id: "plans-payments", title: "Plans & Payments" },
  { id: "user-content", title: "User Content" },
  { id: "acceptable-use", title: "Acceptable Use" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "termination", title: "Termination" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "limitation", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes-terms", title: "Changes to Terms" },
  { id: "contact-terms", title: "Contact Us" },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      effectiveDate="April 21, 2026"
      tocItems={tocItems}
    >
      <p>
        These Terms of Service ("Terms") govern your access to and use of the LensParty platform ("Service"),
        operated by LensParty ("we," "us," or "our"). Please read these Terms carefully before using the Service.
      </p>

      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>
        By creating an account, accessing, or using LensParty, you agree to be bound by these Terms and our{" "}
        <a href="/#/privacy">Privacy Policy</a>. If you do not agree to these Terms, you may not use the Service.
      </p>
      <p>
        If you are using LensParty on behalf of an organization, you represent that you have the authority to bind
        that organization to these Terms.
      </p>

      <h2 id="description">2. Service Description</h2>
      <p>
        LensParty is a collaborative event photo and video sharing platform. The Service allows event organizers
        ("Event Owners") to:
      </p>
      <ul>
        <li>Create events with unique access codes and QR codes</li>
        <li>Invite guests to upload photos and videos to a shared gallery</li>
        <li>View, manage, and download event media</li>
        <li>Display live slideshows of uploaded content</li>
        <li>Collect guestbook messages from attendees</li>
        <li>Print customizable QR code templates for event signage</li>
      </ul>
      <p>
        Guests can access event galleries and upload content using the event's unique code without creating an
        account.
      </p>

      <h2 id="accounts">3. Accounts & Registration</h2>
      <p>To create events on LensParty, you must register for an account. When registering, you agree to:</p>
      <ul>
        <li>Provide accurate and complete information</li>
        <li>Maintain the security of your password and account</li>
        <li>Notify us immediately of any unauthorized access to your account</li>
        <li>Accept responsibility for all activity that occurs under your account</li>
      </ul>
      <p>
        You must be at least 16 years old to create an account. We reserve the right to suspend or terminate
        accounts that violate these Terms.
      </p>

      <h2 id="plans-payments">4. Plans & Payments</h2>

      <h3>Event Plans</h3>
      <p>
        LensParty offers multiple event plans with different features, storage limits, and capabilities. Plan
        details and pricing are displayed on our pricing page and at the time of purchase. Plans are applied
        per-event, not per-account.
      </p>

      <h3>Payment Processing</h3>
      <p>
        All payments are processed securely through <strong>Stripe, Inc.</strong> By making a purchase, you
        also agree to Stripe's{" "}
        <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">Terms of Service</a>.
        All prices are displayed in the currency indicated at checkout.
      </p>

      <h3>Refund Policy</h3>
      <p>
        Plan upgrades are one-time purchases and are generally <strong>non-refundable</strong>. However, if you
        experience a technical issue that prevents you from using a paid feature, contact us within 7 days of
        purchase at{" "}
        <a href="mailto:support@lensparty.com">support@lensparty.com</a>, and we will review your case on an
        individual basis.
      </p>

      <h2 id="user-content">5. User Content</h2>

      <h3>Ownership</h3>
      <p>
        You retain full ownership of all photos, videos, and content you upload to LensParty ("User Content").
        We do not claim any ownership rights over your content.
      </p>

      <h3>License Grant</h3>
      <p>
        By uploading content to LensParty, you grant us a limited, non-exclusive, worldwide license to store,
        display, and transmit your content solely for the purpose of operating and providing the Service. This
        license exists only for as long as your content remains on the platform and terminates when you delete
        the content or your account.
      </p>

      <h3>Content Responsibility</h3>
      <p>You are solely responsible for the content you upload and represent that:</p>
      <ul>
        <li>You have the right to upload and share the content</li>
        <li>The content does not infringe on any third party's intellectual property or privacy rights</li>
        <li>The content complies with applicable laws and these Terms</li>
        <li>You have obtained consent from any individuals depicted in the content, where required by law</li>
      </ul>

      <h3>Guest Uploads</h3>
      <p>
        Event Owners are responsible for the event access codes they share and the content uploaded by guests
        to their events. By sharing an event code, you acknowledge that anyone with the code can upload content
        to your event.
      </p>

      <h2 id="acceptable-use">6. Acceptable Use</h2>
      <p>You agree not to use LensParty to:</p>
      <ul>
        <li>Upload, share, or distribute illegal, harmful, threatening, abusive, defamatory, or obscene content</li>
        <li>Upload content depicting the exploitation or abuse of minors</li>
        <li>Infringe on any person's intellectual property, privacy, or other rights</li>
        <li>Distribute malware, viruses, or other harmful code</li>
        <li>Attempt to gain unauthorized access to the Service, other accounts, or our systems</li>
        <li>Use automated tools (bots, scrapers) to access or collect data from the Service without permission</li>
        <li>Interfere with or disrupt the integrity or performance of the Service</li>
        <li>Use the Service for any commercial purpose other than its intended event sharing functionality</li>
        <li>Circumvent storage limits, access controls, or other technical restrictions</li>
      </ul>
      <p>
        We reserve the right to remove content and suspend or terminate accounts that violate these guidelines,
        without prior notice.
      </p>

      <h2 id="intellectual-property">7. Intellectual Property</h2>
      <p>
        The LensParty name, logo, website design, code, and all associated intellectual property are owned by
        LensParty and protected by applicable copyright, trademark, and other intellectual property laws.
      </p>
      <p>
        You may not copy, modify, distribute, sell, or lease any part of the Service, nor may you reverse
        engineer or attempt to extract the source code, except as permitted by law.
      </p>

      <h2 id="termination">8. Termination</h2>

      <h3>By You</h3>
      <p>
        You may stop using LensParty at any time. To delete your account and associated data, contact us at{" "}
        <a href="mailto:support@lensparty.com">support@lensparty.com</a>.
      </p>

      <h3>By Us</h3>
      <p>
        We may suspend or terminate your account and access to the Service at our discretion, including but not
        limited to cases where:
      </p>
      <ul>
        <li>You violate these Terms or our Acceptable Use policy</li>
        <li>Your account has been inactive for an extended period</li>
        <li>We are required to do so by law</li>
        <li>We discontinue the Service (with reasonable notice)</li>
      </ul>
      <p>
        Upon termination, your right to use the Service ceases immediately. We will make reasonable efforts to
        allow you to retrieve your content before deletion, except in cases of severe Terms violations.
      </p>

      <h2 id="disclaimers">9. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
        PURPOSE, AND NON-INFRINGEMENT.
      </p>
      <p>We do not warrant that:</p>
      <ul>
        <li>The Service will be uninterrupted, timely, secure, or error-free</li>
        <li>Results obtained from the Service will be accurate or reliable</li>
        <li>Any defects in the Service will be corrected</li>
        <li>The Service will be compatible with all devices or browsers</li>
      </ul>
      <p>
        You use the Service at your own risk. We are not responsible for any loss of data, including photos
        and videos, due to technical failures, security breaches, or service interruptions. We strongly
        recommend maintaining your own backups of important content.
      </p>

      <h2 id="limitation">10. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, LENSPARTY AND ITS OWNER, EMPLOYEES, AND AFFILIATES SHALL NOT
        BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
        LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF
        THE SERVICE.
      </p>
      <p>
        OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT
        YOU HAVE PAID TO LENSPARTY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
      </p>

      <h2 id="indemnification">11. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless LensParty and any affiliates
        from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees)
        arising out of or in connection with:
      </p>
      <ul>
        <li>Your use of the Service</li>
        <li>Your violation of these Terms</li>
        <li>Your violation of any third party's rights, including intellectual property or privacy rights</li>
        <li>Any content you upload or share through the Service</li>
      </ul>

      <h2 id="governing-law">12. Governing Law & Dispute Resolution</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
        LensParty operates, without regard to its conflict of law provisions.
      </p>
      <p>
        Any disputes arising from these Terms or your use of the Service shall first be attempted to be resolved
        through good-faith negotiation. If a resolution cannot be reached within 30 days, either party may
        pursue legal remedies in the appropriate courts.
      </p>

      <h2 id="changes-terms">13. Changes to These Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. When we make changes, we will update the
        "Effective date" at the top of this page. For material changes, we will provide notice via email or
        a prominent notice on the Service.
      </p>
      <p>
        Your continued use of LensParty after changes become effective constitutes acceptance of the revised
        Terms. If you do not agree to the updated Terms, you must stop using the Service.
      </p>

      <h2 id="contact-terms">14. Contact Us</h2>
      <p>If you have questions about these Terms of Service, please contact us:</p>
      <ul>
        <li><strong>Company</strong>: LensParty</li>
        <li><strong>Email</strong>: <a href="mailto:support@lensparty.com">support@lensparty.com</a></li>
      </ul>
    </LegalPage>
  );
}
