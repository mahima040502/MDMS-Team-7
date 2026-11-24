import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Input, PasswordInput, Toggle } from "../../../shared/components/forms/Fields";

function emailError(email: string) {
  if (!email.trim()) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
}

function passwordError(password: string) {
  if (!password) return "Enter a new password.";
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Use at least 8 characters, including a letter and a number.";
  }
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const invalidEmail = emailError(email);
  const invalidPassword = password.trim() ? undefined : "Enter your password.";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <h1>Sign in</h1>
      <form className="md-stack" noValidate onSubmit={submit}>
        <Input label="Email address" type="email" autoComplete="username" required
          value={email} onChange={(event) => setEmail(event.target.value)} error={submitted ? invalidEmail : undefined} />
        <PasswordInput label="Password" autoComplete="current-password" required value={password}
          onChange={(event) => setPassword(event.target.value)} error={submitted ? invalidPassword : undefined} />
        <div className="md-actions md-between">
          <Toggle label="Remember me" />
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button className="md-button" type="submit">Sign in</button>
        {submitted && !invalidEmail && !invalidPassword && (
          <p role="status">Form validated. Choose a demo role below to continue.</p>
        )}
      </form>
      <nav className="md-role-links" aria-label="Demo roles">
        <Link to="/user/dashboard">End-user</Link>
        <Link to="/zone/dashboard">Zone admin</Link>
        <Link to="/enterprise/dashboard">Enterprise</Link>
      </nav>
    </>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [destination, setDestination] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const error = emailError(email);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!error) setDestination(email.trim());
  }

  if (destination) {
    return (
      <>
        <h1>Check your email</h1>
        <p>In this demo, a reset link would be sent to <strong>{destination}</strong>.</p>
        <Link className="md-button" to="/reset-password/demo-token">Open demo reset link</Link>
        <div className="md-actions md-between">
          <button className="md-secondary" type="button" onClick={() => setResendCount(resendCount + 1)}>Resend</button>
          <Link to="/login">Back to login</Link>
        </div>
        {resendCount > 0 && <p role="status">Resend simulated ({resendCount}).</p>}
      </>
    );
  }

  return (
    <>
      <h1>Forgot password</h1>
      <p>Enter your email to preview the password reset flow.</p>
      <form className="md-stack" noValidate onSubmit={submit}>
        <Input label="Email address" type="email" autoComplete="email" required value={email}
          onChange={(event) => setEmail(event.target.value)} error={submitted ? error : undefined} />
        <button className="md-button" type="submit">Send reset link</button>
      </form>
      <Link to="/login">Back to login</Link>
    </>
  );
}

function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [complete, setComplete] = useState(false);
  const error = passwordError(password);
  const mismatch = !confirmation ? "Confirm your password."
    : confirmation !== password ? "Passwords must match." : undefined;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!error && !mismatch) {
      setPassword("");
      setConfirmation("");
      setComplete(true);
    }
  }

  if (complete) {
    return (
      <>
        <h1>Password updated</h1>
        <p role="status">Your password passed validation and the demo reset is complete.</p>
        <Link className="md-button" to="/login">Back to login</Link>
      </>
    );
  }

  return (
    <>
      <h1>Reset password</h1>
      <form className="md-stack" noValidate onSubmit={submit}>
        <PasswordInput label="New password" autoComplete="new-password" required value={password}
          hint="Use at least 8 characters, including a letter and a number."
          error={submitted ? error : undefined} onChange={(event) => setPassword(event.target.value)} />
        <PasswordInput label="Confirm password" autoComplete="new-password" required value={confirmation}
          error={submitted ? mismatch : undefined} onChange={(event) => setConfirmation(event.target.value)} />
        <button className="md-button" type="submit">Update password</button>
      </form>
      <Link to="/login">Back to login</Link>
    </>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  return <ResetForm key={token} />;
}
