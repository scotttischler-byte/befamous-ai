export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("INTAKE SUBMISSION:", body);

    return Response.json({
      success: true,
      message: "Intake received",
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Failed to process intake",
      },
      { status: 400 },
    );
  }
}
  