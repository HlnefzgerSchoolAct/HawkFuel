/**
 * PrivacyPage - Privacy Policy for NutriNote+
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Main } from "../components/common";
import "./LegalPage.css";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <Main className="legal-page">
      <div className="legal-page__header">
        <button
          type="button"
          className="legal-page__back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1>Privacy Policy</h1>
        <p className="legal-page__updated">Last updated: February 2025</p>
      </div>

      <article className="legal-page__content">
        <section>
          <h2>1. Overview</h2>
          <p>
            NutriNote+ (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is a calorie and nutrition tracking application.
            We are committed to protecting your privacy. This policy describes what data we collect, how we use it, and your rights.
          </p>
        </section>

        <section>
          <h2>2. Data We Collect</h2>
          <h3>2.1 Data stored locally on your device</h3>
          <p>
            Most of your data is stored locally using your browser&apos;s localStorage. This includes:
          </p>
          <ul>
            <li>User profile (age, gender, weight, height, activity level, goals)</li>
            <li>Food logs and exercise logs</li>
            <li>Recipes and meal templates</li>
            <li>Preferences (theme, macro settings)</li>
            <li>Weight history and streak data</li>
          </ul>
          <p>
            This data never leaves your device unless you choose to sign in and enable cloud sync.
          </p>

          <h3>2.2 Data stored in the cloud (optional)</h3>
          <p>
            If you sign in with Google or email, we sync your data to Firebase (Google Cloud). This allows
            your data to be available across devices. Cloud data includes the same categories as above.
          </p>

          <h3>2.3 Authentication</h3>
          <p>
            When you sign in, we use Firebase Authentication. For Google sign-in, we receive your email and display name.
            We do not store your password. For email/password sign-in, credentials are handled securely by Firebase.
          </p>
        </section>

        <section>
          <h2>3. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Firebase (Google)</strong> – Authentication and cloud data storage</li>
            <li><strong>Vercel</strong> – Hosting and analytics (page views)</li>
            <li><strong>OpenRouter / USDA API</strong> – Food nutrition estimation (when you use AI or database search) and the AI Nutrition Coach (Hack Club proxy)</li>
          </ul>
          <p>
            These services have their own privacy policies. We encourage you to review them.
          </p>
        </section>

        <section>
          <h2>4. How We Use Your Data</h2>
          <ul>
            <li>To provide and improve the app (calorie tracking, BMR/TDEE calculations, sync)</li>
            <li>To personalize your experience (goals, macro targets)</li>
            <li>To estimate nutrition when you describe foods (AI or USDA lookup)</li>
            <li>To provide personalized advice via the AI Nutrition Coach (profile, calorie progress, foods, and goals are sent to the AI service for context)</li>
            <li>To understand usage patterns (aggregate analytics)</li>
          </ul>
          <p>We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2>5. Cookies and Storage</h2>
          <p>
            We use localStorage and IndexedDB for app data. We do not use tracking cookies. Analytics
            (e.g., Vercel) may use anonymized data for performance monitoring.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <ul>
            <li><strong>Access:</strong> You can export all your data from Settings → Data → Export.</li>
            <li><strong>Correction:</strong> You can edit your profile and logs directly in the app.</li>
            <li><strong>Deletion:</strong> You can delete your account and all cloud data from Settings → Data → Delete account. Local data can be cleared via Clear All Data.</li>
            <li><strong>Portability:</strong> Export provides a JSON backup of your data.</li>
          </ul>
        </section>

        <section>
          <h2>7. Data Security</h2>
          <p>
            Data in transit is encrypted (HTTPS). Firebase uses industry-standard security. We do not
            store sensitive payment information (the app does not process payments).
          </p>
        </section>

        <section>
          <h2>8. Children</h2>
          <p>
            NutriNote+ is not directed at children under 13. We do not knowingly collect data from
            children. If you believe a child has provided data, please contact us.
          </p>
        </section>

        <section>
          <h2>9. Changes</h2>
          <p>
            We may update this policy. The &quot;Last updated&quot; date will change. Continued use of the app
            after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            For privacy-related questions, use the &quot;Send Feedback&quot; option in Settings or contact
            the developer through the app&apos;s support channel.
          </p>
        </section>
      </article>
    </Main>
  );
}
