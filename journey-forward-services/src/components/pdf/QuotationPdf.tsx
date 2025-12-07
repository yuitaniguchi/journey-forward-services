import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#000",
  },
  // --- Header Area ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerLeft: {
    width: "60%",
    flexDirection: "column",
  },
  logoImage: {
    width: 200,
    marginBottom: 20,
  },
  logoTextFallback: {
    fontSize: 18,
    fontWeight: "heavy",
    color: "#22503B",
    textTransform: "uppercase",
    marginBottom: 20,
  },
  companyInfo: {
    marginTop: 44,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  textLine: {
    marginBottom: 2,
    lineHeight: 0.8,
  },

  headerRight: {
    width: "40%",
    textAlign: "right",
    paddingTop: 60,
    flexDirection: "column",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  requestNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 2,
  },
  dateLabel: {
    width: 80,
    textAlign: "right",
    marginRight: 10,
    color: "#555",
  },
  dateValue: {
    width: 70,
    textAlign: "right",
  },

  // --- Customer & Pickup Info Area  ---
  infoContainer: {
    flexDirection: "column",
    marginBottom: 20,
    marginTop: 10,
  },
  infoBlock: {
    marginBottom: 20,
    alignItems: "flex-start",
  },

  // --- Table Area ---
  table: {
    width: "100%",
    marginBottom: 20,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  th: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  td: {
    fontSize: 10,
  },
  // Columns
  col1: { width: "10%", textAlign: "center" }, // #
  col2: { width: "50%", textAlign: "left" }, // Item (広くした)
  col3: { width: "15%", textAlign: "center" }, // Qty
  col4: { width: "25%", textAlign: "center" }, // Size (少し広くした)

  // --- Totals Area ---
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    paddingVertical: 2,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 11,
  },
  totalValue: {
    fontSize: 11,
    textAlign: "right",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontWeight: "bold",
    fontSize: 14,
  },
  grandTotalValue: {
    fontWeight: "bold",
    fontSize: 14,
  },
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(
    amount
  );

const formatDate = (date: string | Date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

export const QuotationPdf = ({ request, customer, quotation, logo }: any) => {
  const estimateDate = new Date();
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 2);

  const formatDetails = (floor: any, elevator: any) => {
    const parts = [];
    if (floor) {
      parts.push(`${floor} floor`);
    }
    if (elevator !== undefined && elevator !== null) {
      parts.push(elevator ? "Elevator available" : "No elevator");
    }
    return parts.length > 0 ? parts.join(" / ") : "-";
  };

  const pickupDetails = formatDetails(
    request.pickupFloor,
    request.pickupElevator
  );

  const deliveryDetails = request.deliveryRequired
    ? formatDetails(request.deliveryFloor, request.deliveryElevator)
    : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logo ? (
              <Image src={logo} style={styles.logoImage} />
            ) : (
              <Text style={styles.logoTextFallback}>
                Journey Forward Services
              </Text>
            )}

            <View style={styles.companyInfo}>
              <Text style={styles.sectionTitle}>Journey Forward Services</Text>
              <Text style={styles.textLine}>
                1111 Robson street, Vancouver, BC
              </Text>
              <Text style={styles.textLine}>1A2 3B4, Canada</Text>
              <Text style={styles.textLine}>
                Email: journeyforwardservices@gmail.com
              </Text>
              <Text style={styles.textLine}>Phone: 111 (222) 3333</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.title}>Estimate</Text>
            <Text style={styles.requestNumber}>
              Request number: {request.requestId}
            </Text>

            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Estimate Date:</Text>
              <Text style={styles.dateValue}>{formatDate(estimateDate)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Expiry Date:</Text>
              <Text style={styles.dateValue}>{formatDate(expiryDate)}</Text>
            </View>
          </View>
        </View>

        {/* Info Blocks */}
        <View style={styles.infoContainer}>
          {/* 1. Bill to */}
          <View style={styles.infoBlock}>
            <Text style={styles.sectionTitle}>
              Bill to: {customer.firstName} {customer.lastName}
            </Text>
            <Text style={styles.textLine}>Email: {customer.email}</Text>
            <Text style={styles.textLine}>Phone: {customer.phone || "-"}</Text>
          </View>

          {/* 2. Pick-up & Delivery Info */}
          <View style={styles.infoBlock}>
            <Text style={styles.sectionTitle}>Pick-up &amp; Delivery Info</Text>

            {/* Pickup */}
            <Text style={styles.textLine}>
              Pickup date:{" "}
              {new Date(request.preferredDatetime).toLocaleString()}
            </Text>
            <Text style={styles.textLine}>
              Pickup address: {request.pickupAddress}
            </Text>
            <Text style={styles.textLine}>Other: {pickupDetails}</Text>

            {/* Delivery */}
            {request.deliveryAddress && (
              <>
                <Text style={[styles.textLine, { marginTop: 4 }]}>
                  Delivery address: {request.deliveryAddress}
                </Text>
                <Text style={styles.textLine}>Other: {deliveryDetails}</Text>
              </>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.col1]}>#</Text>
            <Text style={[styles.th, styles.col2]}>Item</Text>
            <Text style={[styles.th, styles.col3]}>Qty</Text>
            <Text style={[styles.th, styles.col4]}>Size</Text>
          </View>

          {request.items.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, styles.col1]}>{i + 1}</Text>
              <Text style={[styles.td, styles.col2]}>{item.name}</Text>
              <Text style={[styles.td, styles.col3]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.col4]}>{item.size}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sub Total:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(quotation.subtotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax (12%):</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(quotation.tax)}
              </Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(quotation.total)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
