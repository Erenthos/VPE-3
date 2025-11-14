import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12
  },
  section: {
    marginBottom: 15
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center"
  },
  segment: {
    marginBottom: 10
  },
  question: {
    marginLeft: 10,
    marginBottom: 5
  }
});

export default function VendorReport({ vendor, segments, ratings }) {
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

        {/* Ratings */}
        <View>
          {segments.map((seg) => (
            <View key={seg.id} style={styles.segment}>
              <Text>
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
