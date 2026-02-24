/**
 * TermsPage - Terms of Service for NutriNote+
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Main } from "../components/common";
import "./LegalPage.css";

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p className="legal-page__updated">Last updated: February 2025</p>
      </div>

      <article className="legal-page__content">
        <section>
          <h2>1. Acceptance</h2>
          <p>
            By using NutriNote+ (&quot;the app&quot;), you agree to these Terms of Service. If you do not agree,
            do not use the app.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            NutriNote+ is a nutrition and calorie tracking application. It helps you log food, calculate
            BMR/TDEE, track macros and micronutrients, and sync data across devices when you sign in.
            Nutrition estimates (from AI or databases) are approximations and should not replace
            professional medical or dietary advice.
          </p>
        </section>

        <section>
          <h2>3. Use of the App</h2>
          <p>You agree to:</p>
          <ul>
            <li>Use the app only for lawful purposes</li>
            <li>Not attempt to circumvent security, rate limits, or access controls</li>
            <li>Not abuse or overload our services</li>
            <li>Provide accurate information when creating an account</li>
          </ul>
        </section>

        <section>
          <h2>4. Disclaimer</h2>
          <p>
            <strong>Not Medical Advice.</strong> NutriNote+ provides general nutrition information and tracking.
            It is not a substitute for professional medical, nutritional, or health advice. Always consult
            a qualified healthcare provider for diet, weight, or health-related decisions.
          </p>
          <p>
            Nutrition data (calories, macros, micronutrients) may come from databases or AI estimation and
            may not be accurate for every food or portion. Use at your own discretion.
          </p>
        </section>

        <section>
          <h2>5. Account and Data</h2>
          <p>
            You are responsible for maintaining the security of your account. If you use cloud sync, your
            data is stored on our infrastructure (Firebase). We process data as described in our
            <button type="button" className="legal-page__link" onClick={() => navigate("/privacy")}>
              Privacy Policy
            </button>.
          </p>
          <p>
            You may delete your account at any time from Settings. This removes your cloud data. Local
            data on your device can be cleared separately.
          </p>
        </section>

        <section>
          <h2>6. Availability</h2>
          <p>
            We strive for high availability but do not guarantee uninterrupted service. The app may be
            modified, suspended, or discontinued at any time. Offline mode allows continued use without
            internet for core tracking features.
          </p>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          <p>
            NutriNote+ and its content (excluding user data) are owned by the developer. You may not
            copy, modify, or distribute the app without permission.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, the app is provided &quot;as is&quot; without warranties of
            any kind. We are not liable for any indirect, incidental, special, or consequential damages
            arising from your use of the app.
          </p>
        </section>

        <section>
          <h2>9. Changes</h2>
          <p>
            We may update these Terms. The &quot;Last updated&quot; date will change. Continued use after changes
            constitutes acceptance. Material changes may be communicated via the app or email.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            For questions about these Terms, use the &quot;Send Feedback&quot; option in Settings.
          </p>
        </section>
      </article>
    </Main>
  );
}
