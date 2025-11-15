import {
  Page,
  Text,
  View,
  Document,
  StyleSheet
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold"
  },
  section: {
    marginBottom: 12
  },
  segment: {
    marginBottom: 14
  },
  question: {
    marginLeft: 10,
    marginBottom: 4
  },
  summaryBox: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 4
  }
});

// Converts numeric score -> label
function getRatingLabel(score: number) {
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5) return "Average";
  return "Bad";
}

function formatDateString(dateArg: string | Date | null | undefined) {
  if (!dateArg) return "N/A";
  const d = typeof dateArg === "string" ? new Date(dateArg) : dateArg;
  // en-IN style dd/mm/yyyy
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function VendorReport({
  vendor,
  segments,
  ratings,
  evaluatorName,
  evaluatedAt
}: {
  vendor: any;
  segments: any[];
  ratings: any[];
  evaluatorName?: string;
  evaluatedAt?: string | Date | null;
}) {
  let totalWeight = 0;
  let weightedSum = 0;

  // Compute weighted score
  segments.forEach((segment) => {
    const segRatings = segment.questions.map((q: any) => {
      const r = ratings.find((x: any) => x.questionId === q.id);
      return r?.score ?? 0;
    });

    const avg =
      segRatings.length > 0
        ? segRatings.reduce((a, b) => a + b, 0) / segRatings.length
        : 0;

    weightedSum += avg * segment.weight;
    totalWeight += segment.weight;
  });

  const finalScore = totalWeight ? weightedSum / totalWeight : 0;
  const ratingLabel = getRatingLabel(finalScore);

  const evaluatedOnStr = evaluatedAt ? formatDateString(evaluatedAt) : "N/A";

  return (
    <Document>
      <Page style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>Vendor Performance Evaluation Report</Text>

        {/* Vendor Info */}
        <View style={styles.section}>
          <Text>Vendor Name: {vendor.name}</Text>
          <Text>Company: {vendor.company || "N/A"}</Text>
          <Text>Email: {vendor.email || "N/A"}</Text>
        </View>

        {/* Evaluated By + On */}
        <View style={styles.section}>
          <Text>Evaluated By: {evaluatorName || "Unknown"}</Text>
          <Text>Evaluated On: {evaluatedOnStr}</Text>
        </View>

        {/* Final Score Summary */}
        <View style={styles.summaryBox}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 4 }}>
            Final Rating: {finalScore.toFixed(2)} / 10 — {ratingLabel}
          </Text>
        </View>

        {/* Segment Details */}
        <View style={{ marginTop: 20 }}>
          {segments.map((seg) => (
            <View key={seg.id} style={styles.segment}>
              <Text style={{ fontSize: 15, marginBottom: 6 }}>
                {seg.name} (Weight: {seg.weight})
              </Text>

              {seg.questions.map((q: any) => {
                const r = ratings.find((x: any) => x.questionId === q.id);

                return (
                  <View key={q.id} style={styles.question}>
                    <Text>• {q.text}</Text>
                    <Text>   Rating: {r?.score ?? 0}/10</Text>
                    <Text>   Comment: {r?.comment || "-"}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
