import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Lock, Mail, User } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { AnimatePresence, motion } from "motion/react";
import type { Variants } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../config/firebase";

const heroBackdrops = [
  "https://image.tmdb.org/t/p/original/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg",
  "https://image.tmdb.org/t/p/original/ctMserH8g2SeOAnCw5gFjdQF8mo.jpg",
  "https://image.tmdb.org/t/p/original/628Dep6AxEtDxjZoGP78TsOxYbK.jpg",
  "https://image.tmdb.org/t/p/original/4XM8DUTQb3lhLemJC51Jx4a2EuA.jpg",
];

export function AuthPage() {
  const {
    signInWithEmail,
    signUpWithEmail,
    loading: authLoading,
  } = useAuth();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroBackdrops.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (isSignUpMode && !name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (isSignUpMode && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (isSignUpMode && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUpMode) {
        await signUpWithEmail(email, password);
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name.trim() });
        }
      } else {
        await signInWithEmail(email, password);
      }
    } catch (authError: any) {
      setError(getFriendlyError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-8 text-white sm:px-6">
      <AnimatePresence mode="wait">
        <motion.img
          key={heroBackdrops[heroIndex]}
          src={heroBackdrops[heroIndex]}
          alt=""
          aria-hidden={true}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_35%),linear-gradient(90deg,rgba(0,0,0,0.78),rgba(0,0,0,0.28),rgba(0,0,0,0.78))]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center"
      >
        <motion.section
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="w-full max-w-[450px] rounded-2xl border border-white/70 bg-white/92 p-6 text-zinc-950 shadow-[0_32px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8"
        >
          <motion.div variants={fieldVariant} className="mb-7 text-center">
            <h1 className="brand-gradient-text text-4xl font-black tracking-tight drop-shadow-sm">
              NETFLIXGPT
            </h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">
              {isSignUpMode ? "Create your cinematic watch room." : "Sign in to continue watching."}
            </p>
          </motion.div>

          <motion.div
            variants={fieldVariant}
            className="relative mb-6 grid grid-cols-2 rounded-full bg-zinc-100 p-1"
            role="tablist"
            aria-label="Authentication mode"
          >
            <motion.div
              layout
              className="absolute bottom-1 top-1 rounded-full bg-zinc-950 shadow-lg"
              animate={{ left: isSignUpMode ? "50%" : "0.25rem", width: "calc(50% - 0.25rem)" }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
            {["Sign In", "Sign Up"].map((label, index) => {
              const active = isSignUpMode === (index === 1);
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setIsSignUpMode(index === 1);
                    setError("");
                  }}
                  className={`relative z-10 min-h-11 rounded-full text-sm font-bold transition-colors ${
                    active ? "text-white" : "text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </motion.div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email - always visible */}
            <FloatingInput
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-5 w-5" />}
              required
            />

            {/* Name - only in Sign Up mode */}
            {isSignUpMode && (
              <FloatingInput
                id="name"
                type="text"
                label="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="h-5 w-5" />}
                required
              />
            )}

            {/* Password - always visible */}
            <FloatingInput
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-5 w-5" />}
              required
            />

            {/* Confirm Password - only in Sign Up mode */}
            {isSignUpMode && (
              <FloatingInput
                id="confirmPassword"
                type="password"
                label="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="h-5 w-5" />}
                required
              />
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="brand-gradient mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-black text-white shadow-[0_18px_42px_rgba(229,9,20,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(255,47,125,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              )}
              {isSubmitting
                ? isSignUpMode
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUpMode
                  ? "Sign Up"
                  : "Sign In"}
            </button>
          </form>

          <motion.div
            variants={fieldVariant}
            className="mt-5 flex items-center justify-between text-sm text-zinc-500"
          >
            <button
              type="button"
              className="font-semibold transition-colors hover:text-zinc-950"
            >
              Forgot password?
            </button>
            {isSignUpMode ? (
              <button
                type="button"
                onClick={() => {
                  setIsSignUpMode(false);
                  setError("");
                }}
                className="cursor-pointer font-semibold text-pink-500 hover:underline"
              >
                Already a member?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSignUpMode(true);
                  setError("");
                }}
                className="cursor-pointer font-semibold text-pink-500 hover:underline"
              >
                New here?
              </button>
            )}
          </motion.div>
        </motion.section>
      </motion.main>
    </div>
  );
}

const fieldVariant: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const getFriendlyError = (error: any) => {
  const code = error?.code || "";
  if (code.includes("wrong-password")) return "Incorrect password. Try again.";
  if (code.includes("user-not-found")) return "No account with this email. Sign up instead?";
  if (code.includes("email-already-in-use")) return "This email is already registered. Try signing in.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("network-request-failed")) return "Network error. Check your connection.";
  return "Something went wrong. Please try again.";
};

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: React.ReactNode;
}

function FloatingInput({ id, label, icon, value, ...props }: FloatingInputProps) {
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <motion.div variants={fieldVariant} className="group relative">
      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-pink-500">
        {icon}
      </div>
      <input
        id={id}
        value={value}
        placeholder=" "
        className="peer min-h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 pb-2.5 pl-12 pt-5 font-semibold text-zinc-950 transition-all placeholder:text-transparent focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-500/15"
        {...props}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-12 transition-all duration-200 ${
          hasValue
            ? "top-2 text-xs text-zinc-500"
            : "top-1/2 -translate-y-1/2 text-sm text-zinc-400 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-pink-500"
        }`}
      >
        {label}
      </label>
    </motion.div>
  );
}
