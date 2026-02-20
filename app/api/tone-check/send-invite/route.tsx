import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, familyId } = await req.json();

    if (!email || !familyId) {
      return Response.json(
        { error: "Missing email or familyId" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "EvenGround <onboarding@resend.dev>",
      to: email,
      subject: "You've been invited to EvenGround",
      html: `
        <h2>You’ve been invited to join EvenGround</h2>
        <p>Click below to join your family:</p>
        <a href="http://localhost:3000/signup?familyId=${familyId}">
          Join Family
        </a>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (err) {
    console.error("Email send error:", err);
    return Response.json({ error: "Email failed" }, { status: 500 });
  }
}