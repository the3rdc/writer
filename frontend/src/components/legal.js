// components/LegalPage.tsx
import React from "react";

const LegalPage = ({
  appName,
  domain,
  contactEmail,
  lastUpdated,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-sm text-gray-800 leading-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Terms of Service & Privacy Policy</h1>
      <p className="mb-6 text-gray-500">Last updated: {lastUpdated}</p>

      <section className="mb-6">
        <p>
          Welcome! By using <strong>{appName}</strong> (the “App”, accessible at{" "}
          <strong>{domain}</strong>), you agree to the terms below. If you don’t agree, please don’t use the App.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">1. Use of the App</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Use the App responsibly and only for lawful purposes.</li>
          <li>Don’t hack, disrupt, or reverse-engineer the App.</li>
          <li>Don’t use the App to harm or harass others.</li>
        </ul>
        <p className="mt-2">
          We may suspend your access if you violate these terms or use the App inappropriately.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">2. Accounts & Login</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Provide a valid email address.</li>
          <li>Keep your login credentials secure.</li>
          <li>You’re responsible for any activity under your account.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">3. Privacy</h2>
        <p>
          We only collect your email address. It’s used to:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Log you into the App.</li>
          <li>Send you updates about your account or the App.</li>
        </ul>
        <p className="mt-2">
          We don’t sell or share your email with third parties, unless legally required.
          You can request deletion of your data anytime by contacting{" "}
          <a href={`mailto:${contactEmail}`} className="text-blue-600 underline">{contactEmail}</a>.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">4. Cookies</h2>
        <p>
          We may use basic cookies or local storage to support login and improve performance.
          We don’t use cookies for advertising or cross-site tracking.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">5. No Warranties</h2>
        <p>
          The App is provided “as is.” We make no guarantees about its availability, reliability, or accuracy.
          Use it at your own risk.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">6. Limitation of Liability</h2>
        <p>
          We are not responsible for any damages or losses resulting from use of the App,
          to the fullest extent allowed by law.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">7. Changes</h2>
        <p>
          We may update these terms from time to time. If changes are significant, we’ll try to let you know.
          Continuing to use the App means you agree to the new terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
        <p>
          Questions? Contact us at{" "}
          <a href={`mailto:${contactEmail}`} className="text-blue-600 underline">{contactEmail}</a>.
        </p>
      </section>
    </div>
  );
};

export default LegalPage;