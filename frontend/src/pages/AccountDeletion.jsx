const AccountDeletion = () => {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", maxWidth: 800, margin: '0 auto', padding: 20, lineHeight: 1.6, color: '#e0e0e0', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', borderBottom: '2px solid #2563eb', paddingBottom: 10 }}>Account Deletion Policy - BULL4X</h1>
      <p style={{ color: '#999', fontStyle: 'italic' }}>Last Updated: February 8, 2026</p>

      <h2 style={{ color: '#fff', marginTop: 30 }}>How to Request Account Deletion</h2>
      <p>You can request the deletion of your BULL4X account and associated data by:</p>
      <ol>
        <li><strong>Email:</strong> Send a request to <a href="mailto:support@bull4x.com" style={{ color: '#2563eb' }}>support@bull4x.com</a> with the subject line "Account Deletion Request" from the email address associated with your account.</li>
        <li><strong>In-App:</strong> Navigate to Profile &gt; Support and submit an account deletion request.</li>
      </ol>

      <h2 style={{ color: '#fff', marginTop: 30 }}>What Happens When You Delete Your Account</h2>
      <p>Upon receiving and verifying your account deletion request:</p>
      <ul>
        <li><strong>Account Data:</strong> Your account profile, login credentials, and preferences will be permanently deleted.</li>
        <li><strong>Trading History:</strong> Your trading history and transaction records will be deleted, except where retention is required by law.</li>
        <li><strong>KYC Documents:</strong> Your identity verification documents will be deleted, subject to regulatory retention requirements.</li>
        <li><strong>Payment Information:</strong> Your saved bank details and payment information will be permanently removed.</li>
        <li><strong>Profile Photos:</strong> Any uploaded profile images will be permanently deleted.</li>
      </ul>

      <h2 style={{ color: '#fff', marginTop: 30 }}>Processing Time</h2>
      <p>Account deletion requests are processed within 30 days of verification. You will receive a confirmation email once your account has been deleted.</p>

      <h2 style={{ color: '#fff', marginTop: 30 }}>Important Notes</h2>
      <ul>
        <li>Ensure all pending withdrawals are completed before requesting account deletion.</li>
        <li>Any remaining balance in your wallet must be withdrawn before account deletion.</li>
        <li>Account deletion is permanent and cannot be reversed.</li>
        <li>Certain data may be retained as required by applicable financial regulations and legal obligations.</li>
      </ul>

      <h2 style={{ color: '#fff', marginTop: 30 }}>Contact Us</h2>
      <p>For questions about account deletion, contact us at:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:support@bull4x.com" style={{ color: '#2563eb' }}>support@bull4x.com</a></li>
        <li><strong>Website:</strong> <a href="https://bull4x.com" style={{ color: '#2563eb' }}>https://bull4x.com</a></li>
      </ul>
    </div>
  )
}

export default AccountDeletion
