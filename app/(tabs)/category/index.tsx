import AddCategory from "@/components/category/AddCategory";
import CategoryList from "@/components/category/CategoryList";
import { useCategory } from "@/hooks/queries/useCategory";
import { getErrorMessage } from "@/utils/errorAlert";
import { Stack } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Category() {
  const { data: categories, isLoading, isError, error } = useCategory();
  const errorMessage = getErrorMessage(error);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "카테고리" }} />
      <FlatList
        data={isLoading || isError ? [] : categories ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CategoryList item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroStatRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>
                    {categories?.length ?? 0}
                  </Text>
                  <Text style={styles.heroStatLabel}>등록된 카테고리</Text>
                </View>
              </View>
            </View>

            <AddCategory />

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>카테고리 목록</Text>
              <Text style={styles.listSubtitle}>
                현재 등록된 운동 분류를 확인하고 정리할 수 있습니다.
              </Text>
            </View>

            {isLoading ? (
              <View style={styles.feedbackState}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.feedbackText}>
                  카테고리를 불러오는 중입니다.
                </Text>
              </View>
            ) : null}

            {isError ? (
              <View style={styles.feedbackState}>
                <Text style={styles.feedbackText}>{errorMessage}</Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !isLoading && !isError ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                아직 등록된 카테고리가 없습니다.
              </Text>
              <Text style={styles.emptyText}>
                위 입력창에서 첫 카테고리를 추가해 루틴 구성을 시작하세요.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    backgroundColor: "#f8fafc",
  },
  heroCard: {
    backgroundColor: "#0f172a",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  heroStatRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  heroStatLabel: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  listHeader: {
    marginTop: 20,
    marginBottom: 14,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
  },
  separator: {
    height: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  feedbackState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  feedbackText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 14,
  },
  emptyCard: {
    marginTop: 8,
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    lineHeight: 20,
  },
});
