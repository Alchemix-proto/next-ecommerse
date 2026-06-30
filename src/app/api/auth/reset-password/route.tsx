import pool from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    await client.query("BEGIN");

    // Find OTP row
    const otpResult = await client.query(
      `SELECT id, otp_hash
       FROM email_otps
       WHERE email = $1
         AND purpose = 'forgot_password'
         AND expires_at > CURRENT_TIMESTAMP
       LIMIT 1`,
      [normalizedEmail]
    );

    const row = otpResult.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(otp.trim(), row.otp_hash);
    if (!isMatch) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await client.query(
      `UPDATE users SET password = $1 WHERE email = $2`,
      [hashedPassword, normalizedEmail]
    );

    // Delete OTP after use
    await client.query(`DELETE FROM email_otps WHERE id = $1`, [row.id]);

    await client.query("COMMIT");

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  } finally {
    client.release();
  }
}
