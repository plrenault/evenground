import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return Response.json(
        { error: "Missing email or token" },
        { status: 400 }
      );
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/signup?token=${token}`;

    const { error } = await resend.emails.send({
      from: "EvenGround <onboarding@resend.dev>",
      to: email,
      subject: "You've been invited to EvenGround",
      html: `
        <h2>You’ve been invited to join EvenGround</h2>
        <p>Click below to join your family:</p>
        <a href="${inviteLink}">
          Join Family
        </a>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return Response.json({ error: "Email failed" }, { status: 500 });
  }
}