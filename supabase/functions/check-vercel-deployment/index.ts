import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return new Response(JSON.stringify({ error: "Project ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Pica API to list Vercel deployments
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/v6/deployments",
      {
        method: "GET",
        headers: {
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY")!,
          "x-pica-connection-key": Deno.env.get("PICA_VERCEL_CONNECTION_KEY")!,
          "x-pica-action-id":
            "conn_mod_def::GCfMzNJKPmg::yZrTYCeHTQSP8lh4ISofFg",
        },
        // Add query parameters
        ...(projectId && {
          method: "GET",
          headers: {
            "x-pica-secret": Deno.env.get("PICA_SECRET_KEY")!,
            "x-pica-connection-key": Deno.env.get(
              "PICA_VERCEL_CONNECTION_KEY",
            )!,
            "x-pica-action-id":
              "conn_mod_def::GCfMzNJKPmg::yZrTYCeHTQSP8lh4ISofFg",
          },
        }),
      },
    );

    // Construct URL with query parameters
    const url = new URL("https://api.picaos.com/v1/passthrough/v6/deployments");
    if (projectId) {
      url.searchParams.append("projectId", projectId);
      url.searchParams.append("limit", "10");
    }

    const deploymentResponse = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-pica-secret": Deno.env.get("PICA_SECRET_KEY")!,
        "x-pica-connection-key": Deno.env.get("PICA_VERCEL_CONNECTION_KEY")!,
        "x-pica-action-id": "conn_mod_def::GCfMzNJKPmg::yZrTYCeHTQSP8lh4ISofFg",
      },
    });

    if (!deploymentResponse.ok) {
      const errorText = await deploymentResponse.text();
      return new Response(
        JSON.stringify({
          error: "Failed to fetch deployments",
          details: errorText,
          status: deploymentResponse.status,
        }),
        {
          status: deploymentResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const deploymentData = await deploymentResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        deployments: deploymentData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error checking Vercel deployment:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
