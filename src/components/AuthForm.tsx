import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === "login";
  const title = isLogin ? "Sign In" : "Create Account";
  const description = isLogin ? "Enter your credentials to access your tasks" : "Sign up to start managing your tasks";
  const buttonText = isLogin ? "Sign In" : "Create Account";
  const alternateText = isLogin ? "Don't have an account?" : "Already have an account?";
  const alternateLink = isLogin ? "/register" : "/login";
  const alternateLinkText = isLogin ? "Sign up" : "Sign in";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "An error occurred");
      }

      if (isLogin) {
        window.location.href = "/";
      } else {
        setSuccess(result.data?.message || "Registration successful! Please check your email.");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLogin ? 1 : 6}
              disabled={isLoading}
            />
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <a href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Please wait..." : buttonText}
          </Button>
          <p className="text-sm text-muted-foreground">
            {alternateText}{" "}
            <a href={alternateLink} className="text-primary hover:underline">
              {alternateLinkText}
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
