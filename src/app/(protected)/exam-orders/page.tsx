"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExamTypeCard } from "@/components/exam-orders/exam-type-card";
import { ExamTypeCategories } from "@/components/exam-orders/exam-type-categories";
import { useExamTypes, useExamOrders } from "@/hooks/use-exam-orders";
import { useExamOrderStore } from "@/stores/exam-order-store";
import { ROUTES, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import type { ExamType } from "@/types";

export default function ExamOrdersPage() {
  const router = useRouter();
  const [category, setCategory] = useState("Todos");
  const { data: examTypes, isLoading: loadingTypes } = useExamTypes(category);
  const { data: activeOrders } = useExamOrders("active");
  const { data: completedOrders } = useExamOrders("completed");
  const { setExamType } = useExamOrderStore();

  const handleSelectExam = (exam: ExamType) => {
    setExamType(exam.id, exam.name, exam.price, exam.preparation_instructions);
    router.push(`${ROUTES.EXAM_ORDERS}/book`);
  };

  return (
    <>
      <header className="pt-12 lg:pt-6 pb-4 px-6 bg-card sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(ROUTES.DASHBOARD)}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <h1 className="text-xl font-bold">Examenes e Imagenes</h1>
        </div>
      </header>

      <main className="px-6 py-6 max-w-md mx-auto lg:max-w-3xl pb-28">
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="catalog">Catalogo</TabsTrigger>
            <TabsTrigger value="active">
              Activas {activeOrders && activeOrders.length > 0 && `(${activeOrders.length})`}
            </TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-4">
            <ExamTypeCategories selected={category} onSelect={setCategory} />

            {loadingTypes ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {examTypes?.map((exam) => (
                  <ExamTypeCard
                    key={exam.id}
                    exam={exam}
                    onSelect={handleSelectExam}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-3">
            {!activeOrders || activeOrders.length === 0 ? (
              <div className="text-center pt-8">
                <MaterialIcon name="biotech" className="text-gray-300 text-5xl mb-3" />
                <p className="text-sm text-muted-foreground">No tienes ordenes activas</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => router.push(`${ROUTES.EXAM_ORDERS}/${order.id}`)}
                  className="w-full p-4 bg-card rounded-2xl shadow-soft text-left hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">
                      {order.exam_type?.name}
                    </p>
                    <Badge className={ORDER_STATUS_COLORS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.medical_center?.name} -{" "}
                    {new Date(order.scheduled_date).toLocaleDateString("es", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </button>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {!completedOrders || completedOrders.length === 0 ? (
              <div className="text-center pt-8">
                <MaterialIcon name="history" className="text-gray-300 text-5xl mb-3" />
                <p className="text-sm text-muted-foreground">Sin historial de ordenes</p>
              </div>
            ) : (
              completedOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => router.push(`${ROUTES.EXAM_ORDERS}/${order.id}`)}
                  className="w-full p-4 bg-card rounded-2xl shadow-soft text-left hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">
                      {order.exam_type?.name}
                    </p>
                    <Badge className={ORDER_STATUS_COLORS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.medical_center?.name} -{" "}
                    {new Date(order.scheduled_date).toLocaleDateString("es", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
