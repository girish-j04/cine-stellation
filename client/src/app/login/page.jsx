"use client";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  const handleLogin = ({ email, password }) => {
    console.log('Login:', email, password);
    // We'll replace this with real auth soon
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
}
