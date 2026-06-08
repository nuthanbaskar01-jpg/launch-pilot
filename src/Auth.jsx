import {
  Rocket,
  Target,
  Compass,
  List,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function Auth() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
  setMessage(error.message);
    setMessageType("error");
    } else {
      setMessage(
      "Account created! Check your email to verify your account."
    );
    setMessageType("success");

  setMode("signin");
}
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
  }

  async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) {
    setMessage(error.message);
    setMessageType("error");
  }
}

return (
  <div
    className="login-root"
    style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "#080b10",
      color: "#e6ecf5",
      fontFamily: "Inter, sans-serif",
    }}
  >
    <div
      className="login-hero"
      style={{
        padding: "80px 70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingTop: "60px",
        borderRight: "1px solid #1e2736",
        background:
          "linear-gradient(to bottom,#0d1117,#080b10)",
          position: "relative",
          overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(210, 198, 198, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          opacity: 0.7,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "12px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "#f97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
          }}
        >
          <Rocket size={24} color="#150a00" />
        </div>
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            textAlign: "left",
          }}
        >
          LaunchPilot
        </div>

        <div
          style={{
            fontSize: "9px",
            letterSpacing: "5px",
            opacity: 0.8,
            textTransform: "uppercase",
            color: "#6a7d95",
            marginTop: "1px",
          }}
        >
          AI HEAD OF GROWTH
        </div>
      </div>
    </div>


      <h2
        style={{
          fontSize: "34px",
          textAlign: "left",
          fontWeight: 800,
          lineHeight: "1.12",
          letterSpacing: "-1.5px",
          marginTop: "30px",
          marginBottom: "12px",
          maxWidth: "560px",
        }}
      >
        Your AI co-pilot for acquiring the first 10 users.
      </h2>

      <p
        style={{
          fontSize: "16px",
          textAlign: "left",
          color: "#8fa0b8",
          lineHeight: "1.7",
          maxWidth: "500px",
          marginBottom: "60px",
        }}
      >
        Turn a product brief into a full go-to-market —
        strategy, content, outreach, and a daily execution
        playbook.
      </p>
      <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "22px",
        alignItems: "flex-start",
        maxWidth: "420px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "8px",
            background: "rgba(249,115,22,.08)",
            border: "1px solid rgba(249,115,22,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Target size={14} color="#fb923c" />
        </div>

        <div>
          <h3 style={{ margin: 0, marginBottom: "4px", textAlign: "left", fontSize: "15px", fontWeight: 700, lineHeight: "1.2"}}>
            Product Intelligence
          </h3>

          <p style={{ opacity: 1, margin: 0, textAlign: "left", fontSize: "14px", color: "#8fa0b8", lineHeight: "1.5",}}>
            ICP, wedge analysis, competitive positioning.
          </p>
        </div>
      </div>

    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
      }}
    >
  <div
    style={{
      width: "42px",
      height: "42px",
      borderRadius: "8px",
      background: "rgba(249,115,22,.08)",
      border: "1px solid rgba(249,115,22,.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
  <Compass size={14} color="#fb923c" />
  </div>

  <div>
    <div
      style={{
        maxWidth: "320px",
      }}
    ></div>
    <h3
      style={{
        margin: 0,
        marginBottom: "4px",
        textAlign: "left",
        fontSize: "15px",
        fontWeight: 700,
        lineHeight: "1.2",
      }}
    >
      Audience Discovery
    </h3>

    <p
      style={{
        margin: 0,
        
        fontSize: "14px",
        color: "#8fa0b8",
        lineHeight: "1.5",
      }}
    >
      Ranked communities with engagement scores.
    </p>
  </div>
</div>

      <div
  style={{
    display: "flex",
    gap: "12px",
    alignItems: "center",
  }}
>
  <div
    style={{
      width: "42px",
      height: "42px",
      borderRadius: "8px",
      background: "rgba(249,115,22,.08)",
      border: "1px solid rgba(249,115,22,.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <List size={14} color="#fb923c" />

  </div>

  <div>
    <h3
      style={{
        margin: 0,
        marginBottom: "4px",
        textAlign: "left",
        fontSize: "15px",
        fontWeight: 700,
        lineHeight: "1.2",
      }}
    >
      First-10 Playbook
    </h3>

    <p
      style={{
        margin: 0,
        textAlign: "left",
        fontSize: "14px",
        color: "#8fa0b8",
        lineHeight: "1.5",
      }}
    >
      Day-by-day execution plan to real users.
    </p>
  </div>
</div>
    </div>
    </div>

    <div
      className="login-panel"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        className="login-card"
        style={{
          width: "100%",
          maxWidth: "560px",
          padding: "40px",
          background: "transparent",
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            margin: 0,
            marginBottom: "8px",
            color: "#e6ecf5",
          }}
        >
          {mode === "signin"
            ? "Welcome back"
            : "Create account"}
        </h2>
        <p
  style={{
    color: "#8fa0b8",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "32px",
    lineHeight: "1.5",
    textAlign: "center"
  }}
>
  {mode === "signin"
    ? "Sign in to your LaunchPilot workspace."
    : "Start your go-to-market mission today."}
</p>
<button
  onClick={signInWithGoogle}
  style={{
    width: "420px",
    height: "44px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    borderRadius: "10px",
    border: "1px solid #243044",
    background: "#141a26",
    color: "#e6ecf5",
    cursor: "pointer",
    marginBottom: "18px",
    fontWeight: 500,
  }}
>
 <>
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>

  Continue with Google
</>
</button>
<div
  style={{
    display: "flex",
    alignItems: "center",
    width: "420px",
    marginBottom: "18px",
  }}
>
  <div
    style={{
      flex: 1,
      height: "1px",
      background:"rgba(143,160,184,.15)",
    }}
  />

  <span
    style={{
      padding: "0 12px",
      color: "#6a7d95",
      fontSize: "12px",
    }}
  >
    OR
  </span>

  <div
    style={{
      flex: 1,
      height: "1px",
      background: "rgba(143,160,184,.15)",
    }}
  />
</div>
<div style={{ marginTop: "18px" }}></div>
        <label
          style={{
            width: "420px",
            display: "block",
            textAlign: "left",
            marginBottom: "6px",
            fontSize: "11px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#6a7d95",
            fontWeight: 600,
          }}
        >
          Email
        </label>
        <div
          style={{
            width: "420px",
          }}
        >
        <input
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
          width: "100%",
          height: "46px",
          borderRadius: "12px",
          border: "1px solid #243044",
          background: "#111620",
          color: "#e6ecf5",
          padding: "0 16px",
          fontSize: "14px",
          transition: "all 0.2s ease",
          outline: "none",
          boxSizing: "border-box",
        }}
        />
        </div> 

        <div style={{ marginTop: "18px" }}></div>
          <label
            style={{
              width: "420px",
              display: "block",
              textAlign: "left",
              marginBottom: "6px",
              fontSize: "11px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "#6a7d95",
              fontWeight: 600,
            }}
          >
            Password
          </label>
          
          <div
            style={{
              position: "relative",
              width: "420px",
            }}
          >

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #243044",
              background: "#0d1117",
              color: "#e6ecf5",
              padding: "0 42px 0 14px",
              fontSize: "14px",
              transition: "all 0.2s ease",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6a7d95",
              padding: 0,
            }}
          >
            {showPassword ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        </div>
        

        <button
          onClick={
            mode === "signin"
              ? signIn
              : signUp
          }
          style={{
          width: "420px",
          height: "48px",
          borderRadius: "12px",
          border: "none",
          background: "linear-gradient(180deg,#fb923c,#f97316)",
          boxShadow: "0 8px 30px rgba(249,115,22,.25)",
          color: "#150a00",
          fontWeight: 700,
          fontSize: "14px",
          cursor: "pointer",
          marginTop: "24px",
          transition: "all 0.2s ease",
        }}
        >
          {mode === "signin"
            ? "Sign In"
            : "Create Account"}
        </button>

        {message && (
  <p
    style={{
      marginTop: "12px",
      color:
          messageType === "success"
              ? "#22c55e"
              : "#ef4444",
      fontSize: "13px",
      textAlign: "center",
      maxWidth: "420px",
      lineHeight: "1.5",
    }}
  >
    {message}
  </p>
)}

        <div
          style={{
            marginTop: "20px",
            fontSize: "14px",
            color: "#8fa0b8",
          }}
        >
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}

          <button
            style={{
              background: "none",
              border: "none",
              color: "#fb923c",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              padding: 0,
            }}
            onClick={() =>
              setMode((m) =>
                m === "signin"
                  ? "signup"
                  : "signin"
              )
            }
          >
            {mode === "signin"
              ? "Sign up"
              : "Sign in"}
          </button>
        </div>
      <div
        style={{
          marginTop: "16px",
          fontSize: "12px",
          color: "#6a7d95",
          textAlign: "center",
          maxWidth: "420px",
          lineHeight: "1.5",
        }}
      >
        By continuing you agree to our Terms and
        Privacy Policy.
      </div>

        <div style={{ marginTop: "18px" }}>


        <button
            style={{
              background: "transparent",
              border: "none",
              color: "#fb923c",
              cursor: "pointer",
              fontSize: "14px",
            }}
            onClick={() =>
            setMode((m) =>
              m === "signin"
                ? "signup"
                : "signin"
            )
          }
        >

        </button>
      </div>
    </div>
    </div>
  </div>
);
}