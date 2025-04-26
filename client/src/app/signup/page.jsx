"use client";
import AuthForm from "../components/AuthForm";

export default function SignupPage() {
  const handleSignup = ({ email, password }) => {
    console.log('Signup:', email, password);
    // We'll replace this with real registration soon
  };

  return <AuthForm type="signup" onSubmit={handleSignup} />;
}
