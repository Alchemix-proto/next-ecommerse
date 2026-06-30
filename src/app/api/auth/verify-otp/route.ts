import pool from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"
import bcrypt from "bcryptjs";
import { sendEmail } from "@/src/lib/nodeMailer";
import { SignJWT } from "jose";

export const runtime = "nodejs";

function generateOtp() {
  // return Math.floor(100000 + Math.random() * 900000).toString();?
  return crypto.randomBytes(32).toString("hex");
}
type Data = {
  id: number | null;
  otp_hash: string | null;
  email: string | null;
  purpose: string | null;
  expires_at: Date | null;
};
function getMailText(purpose: "register" | "forgot_password" | "login") {
  if (purpose === "register") {
    return {
      subject: "Verify your Calicut Watches email",
      title: "verify Your Email",
    };
  }

  if (purpose === "forgot_password") {
    return {
      subject: "Reset your Calicut Watches password",
      title: "reset Your Password",
    };
  }

  return {
    subject: "Login OTP for Calicut Watches",
    title: "Login in your account",
  };
}

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return new TextEncoder().encode(secret);
}

async function createAuthToken(user: {
  id: number;
  email: string;
  role: "admin" | "customer";
}) {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, purpose } = body;
      if (!email || !purpose) {
        return NextResponse.json(
          { error: "Email and purpose are required" },
          { status: 400 }
        );
      }

      if (!["verify_mail", "forgot_password", "login_otp"].includes(purpose)) {
        return NextResponse.json(
          { error: "Invalid purpose" },
          { status: 400 }
        );
      }
      const normalizedEmail = String(email).toLowerCase().trim();


      const userResult = await pool.query(
        `
      SELECT id, email_verified
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
        [normalizedEmail]
      );
      // console.log(2)
      const user = userResult.rows[0];

      if (purpose === "register") {
        if (!user) {
          return NextResponse.json(
            { error: "Account not found. Please register first." },
            { status: 404 }
          );
        }

        if (user.email_verified) {
          return NextResponse.json(
            { error: "Email is already verified" },
            { status: 400 }
          );
        }
      }

      if (purpose === "login") {
        if (!user) {
          return NextResponse.json(
            { error: "Account not found" },
            { status: 404 }
          );
        }

        if (!user.email_verified) {
          return NextResponse.json(
            { error: "Please verify your email before login" },
            { status: 403 }
          );
        }
      }

      if (purpose === "forgot_password") {
        // Security: do not reveal whether email exists or not.
        if (!user) {
          return NextResponse.json({
            message: "If this email exists, OTP has been sent.",
          });
        }
      }

      // console.log(3)
      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      // console.log(4)
      // Optional: expire old unused OTPs for same email
      await pool.query(
        `
      DELETE FROM email_otps
      WHERE email = $1
        AND purpose = $2
        AND expires_at > CURRENT_TIMESTAMP
      `,
        [normalizedEmail, purpose]
      );
      // console.log(6)
      await pool.query(
        `
      INSERT INTO email_otps (email, otp_hash, purpose, expires_at)
      VALUES ($1, $2, $3, $4)
      `,
        [normalizedEmail, purpose, otpHash, expiresAt]
      );
      // console.log(89)
      const mailText = getMailText(purpose);

      await sendEmail(normalizedEmail, mailText.subject, `<div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
        <div style="max-width:520px; margin:auto; background:white; border-radius:12px; padding:30px;">
          <h2 style="margin:0 0 10px; color:#111;">Calicut Watches</h2>

          <p style="color:#555; font-size:15px;">
            Use this OTP to ${mailText.title}.
          </p>

          <p style="color:#555; font-size:15px;">Your OTP is:</p>

          
              <a 
                href="http://localhost:3000/api/auth/verify-otp?otp=${otp}&purpose=register&email=${normalizedEmail}"
                style="
                  display:inline-block;
                  background:#000;
                  color:#fff;
                  padding:12px 22px;
                  border-radius:8px;
                  text-decoration:none;
                  font-weight:bold;
                  margin-top:10px;
                "
              >
                Verify Email
              </a>

              <p style="font-size:13px; color:#777; margin-top:20px;">
                If the button does not work, copy and open this link:
              </p>

              <p style="font-size:13px; word-break:break-all; color:#555;">
               http://localhost:3000/api/auth/verify-otp?otp=${otp}&purpose=register&email=${normalizedEmail}
              </p>

          <p style="font-size:13px; color:#777; margin-top:25px;">
            This OTP/link is valid for 10 minutes.
          </p>

          <p style="font-size:13px; color:#777;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>`)

      return NextResponse.json({
        message: "OTP sent successfully",
      }, { status: 200 });
    } catch (error) {
      console.error("Send OTP error:", error);

      return NextResponse.json(
        { error: "Failed to send OTP" },
        { status: 500 }
      );
    }
  }
 export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(req.url);
    const otp = searchParams.get("otp");
    const purpose = searchParams.get("purpose");
    const email = searchParams.get("email");

    if (!otp || !purpose || !email) {
      return NextResponse.json(
        { error: "Required query parameters are missing." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const userResult = await pool.query(
      `SELECT id, email, role, email_verified FROM users WHERE email = $1 LIMIT 1`,
      [normalizedEmail]
    );
    const user = userResult.rows[0];
    const normalizedOtp = otp.trim();

    await client.query("BEGIN");

    if (purpose === "register") {
      const otpResult = await client.query(
        `SELECT id, email, otp_hash
         FROM email_otps
         WHERE email = $1
           AND purpose = 'register'
           AND expires_at > CURRENT_TIMESTAMP
         LIMIT 1`,
        [normalizedEmail]
      );

      const row = otpResult.rows[0] as Data | undefined;
      if (!row?.otp_hash || !row.email || !row.id) {
        await client.query("ROLLBACK");
        return NextResponse.redirect(new URL("/login?verified=failed", req.url));
      }

      const isMatch = await bcrypt.compare(normalizedOtp, row.otp_hash);
      if (!isMatch) {
        await client.query("ROLLBACK");
        return NextResponse.redirect(new URL("/login?verified=failed", req.url));
      }

      await client.query("UPDATE users SET email_verified = true WHERE email = $1", [normalizedEmail]);
      await client.query("DELETE FROM email_otps WHERE id=$1", [row.id]);

      await client.query("COMMIT");
      return NextResponse.redirect(new URL("/login?verified=success", req.url));
    }

    if (purpose === "login") {
      const token = await createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      await client.query("COMMIT");

      const response = NextResponse.json({
        message: "Logged in successfully",
        user,
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    if (purpose === "forgot_password") {
      // any password reset logic here
      await client.query("COMMIT");
      return NextResponse.json({
        message: "Password reset successfully",
      });
    }

    // fallback
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Verify OTP link error:", error);
    return NextResponse.redirect(new URL("/login?verified=error", req.url));
  } finally {
    client.release();
  }
}
