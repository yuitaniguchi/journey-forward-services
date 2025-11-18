export async function POST(req: Request) {
    try {

      const data = await req.json();
    // basic validation of the parameters
    if (
    !data.serviceType ||
    !data.address ||
    !data.dateTime ||
    !Array.isArray(data.items)
  ) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400 }
    );
  }
  
      console.log("📦 Received booking:", data);
  
      // simple response
      return new Response(
        JSON.stringify({ message: "Booking received!", received: data }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error in booking API:", error);
  
      return new Response(
        JSON.stringify({ error: "Failed to process booking" }),
        { status: 500 }
      );
    }
  }