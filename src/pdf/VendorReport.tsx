import {
  Page,
  Text,
  View,
  Document,
  StyleSheet
} from "@react-pdf/renderer";

// PDF Styles
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
    marginBottom: 15
  },
  segment: {
    marginBottom: 10
  },
  question: {
    marginLeft: 10,
    marginBottom: 5
  },
  summaryBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 4
  }
});

export default function VendorReport({ vendor, segments, ratings }) {
  // Compute weighted score
  let totalWeight = 0;
  let weightedSum = 0;

  const segmentSummaries = segments.map((segment) => {
    const segRatings = segment.questions.map((q) => {
      const r = ratings.find((x) => x.questionId === q.id);
      return r?.score ?? 0;
    });

    const avg =
      segRatings.length > 0
        ? segRatings.reduce((a, b) => a + b, 0) / segRatings.length
        : 0;

    const weighted = avg * segment.weight;

    totalWeight += segment.weight;
    weightedSum += weighted;

    return {
      id: segment.id,
      name: segment.name,
      avg,
      weight: segment.weight,
      weighted
    };
  });

  const finalScore =
    totalWeight > 0 ? weightedSum / totalWeight : 0;

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Vendor Performance Evaluation Report</Text>

        {/* Vendor Info */}
        <View style={styles.section}>
          <Text>Vendor Name: {vendor.name}</Text>
          <Text>Company: {vendor.company || "N/A"}</Text>
          <Text>Email: {vendor.email || "N/A"}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
            Final Weighted Score: {finalScore.toFixed(2)} / 10
          </Text>

          {segmentSummaries.map((s) => (
            <Text key={s.id}>
              {s.name}: Avg {s.avg.toFixed(2)} × Weight {s.weight} ={" "}
              {s.weighted.toFixed(2)}
            </Text>
          ))}
        </View>

        {/* Segment Details */}
        <View style={{ marginTop: 20 }}>
          {segments.map((seg) => (
            <View key={seg.id} style={styles.segment}>
              <Text style={{ fontSize: 15, marginBottom: 4 }}>
                {seg.name} (Weight: {seg.weight})
              </Text>

              {seg.questions.map((q) => {
                const r = ratings.find((x) => x.questionId === q.id);

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
