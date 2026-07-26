import Layout from '../components/Layout'

export default function PrivacyPolicy() {
  return (
    <Layout
      title="Privacy Policy | Camp Collective ATX"
      description="Privacy Policy for Camp Collective ATX — how we collect, use, and protect your information."
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective Date: July 2, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">1. Introduction</h2>
            <p>
              Camp Collective ATX ("we," "us," or "our") is operated by Shane and Shayna Tobin in Austin, Texas.
              This Privacy Policy explains how we collect, use, and protect information when you visit{' '}
              <strong>campcollectiveatx.com</strong> (the "Site").
            </p>
            <p>
              By using the Site, you agree to the practices described in this policy. If you do not agree,
              please do not use the Site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">2. Information We Collect</h2>
            <p><strong>Information you provide directly:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your name and email address when you submit a camp listing or contact us</li>
              <li>Camp details (name, website, category, description) when you use our camp submission form</li>
            </ul>
            <p className="mt-3"><strong>Information collected automatically:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address and general location</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on the Site</li>
              <li>Referring URL</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> use third-party advertising trackers, sell your data, or use
              behavioral advertising of any kind.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and respond to camp submission requests</li>
              <li>To respond to messages or questions you send us</li>
              <li>To maintain and improve the Site</li>
              <li>To understand how people use the Site so we can make it better</li>
            </ul>
            <p className="mt-3">
              We will not send you unsolicited marketing emails without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">4. Camp Listing Data</h2>
            <p>
              Camp information displayed on this Site (camp names, addresses, phone numbers, websites,
              descriptions, and schedules) is sourced from publicly available information and voluntary
              submissions from camp operators. This information is publicly available and is not considered
              private. If you are a camp operator and wish to update or remove your listing, please contact us.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">5. Third-Party Services</h2>
            <p>We use the following third-party services to operate this Site:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Airtable</strong> — stores our camp database and form submissions.{' '}
                <a href="https://www.airtable.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-coral underline">
                  Airtable Privacy Policy
                </a>
              </li>
              <li>
                <strong>Vercel</strong> — hosts the Site.{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand-coral underline">
                  Vercel Privacy Policy
                </a>
              </li>
            </ul>
            <p className="mt-3">
              We do not share your personal information with any other third parties except as required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">6. Children's Privacy</h2>
            <p>
              This Site is directed at parents and adults seeking summer camp information for their children.
              We do not knowingly collect personal information from children under the age of 13. If you
              believe that a child under 13 has submitted personal information to us, please contact us at{' '}
              <a href="mailto:shayna.tobin@gmail.com" className="text-brand-coral underline">
                shayna.tobin@gmail.com
              </a>{' '}
              and we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">7. Your Rights (Texas Residents)</h2>
            <p>
              Under the Texas Data Privacy and Security Act (TDPSA), Texas residents have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Know what personal data we have collected about you</li>
              <li>Request correction of inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of the sale of personal data (we do not sell personal data)</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:shayna.tobin@gmail.com" className="text-brand-coral underline">
                shayna.tobin@gmail.com
              </a>
              . We will respond within 45 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">8. Data Retention</h2>
            <p>
              We retain personal information (such as camp submission emails) only as long as necessary to
              fulfill the purpose for which it was collected, and then delete it. Camp listing data sourced
              from public records is retained indefinitely as part of the directory.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">9. Security</h2>
            <p>
              We use industry-standard security measures to protect your information, including HTTPS
              encryption for all data transmitted to and from the Site. However, no method of electronic
              transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the
              "Effective Date" at the top of this page. Material changes will be noted prominently.
              Your continued use of the Site after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">11. Contact Us</h2>
            <p>
              Questions about this Privacy Policy? Contact us at:{' '}
              <a href="mailto:shayna.tobin@gmail.com" className="text-brand-coral underline">
                shayna.tobin@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </Layout>
  )
}
