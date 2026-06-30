import pool from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//     const client = await pool.connect();
//     try {
//         const { searchParams } = new URL(req.url)
//         const otp :string|null= searchParams.get("otp");
//         const purpose : string|null = searchParams.get("purpose");
//         if (!otp) {
//             return NextResponse.json(
//                 { error: " OTP ARE NOT FOUND" },
//                 { status: 400 }
//             );
//         }
//         const normalizedOtp = otp.trim();
//         // const otpRecord = await client.query(
//         //   "SELECT * FROM email_otps WHERE purpose = $1 AND expires_at > NOW()",
//         //   [normalizedPurpose]
//         // );
//         await client.query("BEGIN");
// {if(purpose =="register") {}
//         const otpResult = await client.query(
//             `
//       SELECT id, email
//       FROM email_otps
//       WHERE otp_hash = $1
//         AND purpose = 'register'
//         AND expires_at > CURRENT_TIMESTAMP
//       LIMIT 1
//       `,
//             [normalizedOtp]
//         );
//         if (!(otpResult.rows[0])) {
//             await client.query("ROLLBACK");

//             return NextResponse.redirect(
//                 new URL("/login?verified=failed", req.url)
//             );
//         }

//         await client.query('UPDATE users SET email_verified = true WHERE email = $1'[otpResult.rows[0].email])
//         await client.query('DELETE FROM email_otps WHERE id=$1',[otpResult.rows[0].id])
//     }
//         await client.query('COMMIT')
//         return NextResponse.redirect(new URL("/login?verified=success", req.url))
//     } catch (error) {
//     await client.query("ROLLBACK");

//     console.error("Verify OTP link error:", error);

//     return NextResponse.redirect(
//       new URL("/login?verified=error", req.url)
//     );
//   } finally {
//     client.release();
//   }
// }
