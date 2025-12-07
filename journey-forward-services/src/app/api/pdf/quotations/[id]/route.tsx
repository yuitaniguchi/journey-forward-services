import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { QuotationPdf } from "@/components/pdf/QuotationPdf";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = Number(id);

    const requestData = await prisma.request.findUnique({
      where: { id: requestId },
      include: { customer: true, items: true, quotation: true },
    });

    if (!requestData || !requestData.quotation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const logoPath = path.join(process.cwd(), "public", "pdf-logo.png");
    let logoBuffer: Buffer | null = null;

    try {
      if (fs.existsSync(logoPath)) {
        logoBuffer = fs.readFileSync(logoPath);
      } else {
        console.warn("Logo file not found at:", logoPath);
      }
    } catch (e) {
      console.error("Failed to load logo image", e);
    }

    const pickupAddress = [
      requestData.pickupAddressLine1,
      requestData.pickupAddressLine2,
      requestData.pickupCity,
      requestData.pickupState,
      requestData.pickupPostalCode,
    ]
      .filter(Boolean)
      .join(", ");

    const deliveryAddress = requestData.deliveryRequired
      ? [
          requestData.deliveryAddressLine1,
          requestData.deliveryAddressLine2,
          requestData.deliveryCity,
          requestData.deliveryState,
          requestData.deliveryPostalCode,
        ]
          .filter(Boolean)
          .join(", ")
      : undefined;

    const props = {
      request: {
        requestId: requestData.id,
        preferredDatetime: requestData.preferredDatetime,
        pickupAddress,
        deliveryAddress,
        deliveryRequired: requestData.deliveryRequired,
        pickupFloor: requestData.pickupFloor,
        pickupElevator: requestData.pickupElevator,
        deliveryFloor: requestData.deliveryFloor,
        deliveryElevator: requestData.deliveryElevator,
        items: requestData.items,
      },
      customer: requestData.customer,
      quotation: {
        subtotal: Number(requestData.quotation.subtotal),
        tax: Number(requestData.quotation.tax),
        total: Number(requestData.quotation.total),
      },
      logo: logoBuffer,
    };

    const stream = await renderToStream(<QuotationPdf {...props} />);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="estimate-${requestId}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
