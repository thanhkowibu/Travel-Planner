"use client";

import { useState } from "react";
import { Settings, Play, Info, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Playground() {
  // State cho các tham số
  const [populationSize, setPopulationSize] = useState(50);
  const [generations, setGenerations] = useState(50);
  const [mutationRate, setMutationRate] = useState(0.1);

  // State cho form input
  const [city, setCity] = useState("Hanoi");
  const [budget, setBudget] = useState(500000);
  const [startTime, setStartTime] = useState(8);
  const [endTime, setEndTime] = useState(18);
  const [pace, setPace] = useState("normal");

  // State cho kết quả
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);

  // Hàm reset
  const handleReset = () => {
    setPopulationSize(50);
    setGenerations(50);
    setMutationRate(0.1);
  };

  // Hàm chạy thuật toán
  const runAlgorithm = async () => {
    setLoading(true);
    setResult(null);
    const startExecution = Date.now();

    try {
      const res = await fetch("http://localhost:8000/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city,
          budget: Number(budget),
          start_time: Number(startTime),
          end_time: Number(endTime),
          interests: [],
          pace: pace,
          algorithm_params: {
            population_size: populationSize,
            generations: generations,
            mutation_rate: mutationRate,
          },
        }),
      });

      const data = await res.json();
      const endExecution = Date.now();
      setExecutionTime((endExecution - startExecution) / 1000);

      if (data.status === "success") {
        setResult(data.result);
      } else {
        alert("Có lỗi: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
          <Settings className="w-10 h-10" />
          Algorithm Playground
        </h1>
        <p className="text-muted-foreground">
          Điều chỉnh tham số thuật toán và xem kết quả thay đổi thế nào
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: Tham số thuật toán */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Tham số thuật toán
              </CardTitle>
              <CardDescription>Tùy chỉnh Genetic Algorithm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Population Size */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Population Size</Label>
                  <Badge variant="secondary">{populationSize}</Badge>
                </div>
                <Slider
                  value={[populationSize]}
                  onValueChange={([value]) => setPopulationSize(value)}
                  min={20}
                  max={200}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Số lượng lịch trình trong mỗi thế hệ. Càng lớn = càng chính
                  xác nhưng chậm hơn.
                </p>
              </div>

              <Separator />

              {/* Generations */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Generations</Label>
                  <Badge variant="secondary">{generations}</Badge>
                </div>
                <Slider
                  value={[generations]}
                  onValueChange={([value]) => setGenerations(value)}
                  min={10}
                  max={200}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Số lần lặp lại quá trình tiến hóa. Càng nhiều = kết quả càng
                  tốt.
                </p>
              </div>

              <Separator />

              {/* Mutation Rate */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Mutation Rate</Label>
                  <Badge variant="secondary">
                    {(mutationRate * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Slider
                  value={[mutationRate * 100]}
                  onValueChange={([value]) => setMutationRate(value / 100)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Xác suất đột biến ngẫu nhiên. Quá cao = mất ổn định, quá thấp
                  = kẹt cục bộ.
                </p>
              </div>

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset về mặc định
              </Button>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>💡 Gợi ý:</strong>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>Tăng Population Size nếu muốn kết quả tốt hơn</li>
                <li>Tăng Generations nếu chưa hội tụ</li>
                <li>Mutation Rate tốt nhất: 5-15%</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* CỘT GIỮA: Input chuyến đi */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Thông tin chuyến đi</CardTitle>
            <CardDescription>Cấu hình bài toán tối ưu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Thành phố</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hanoi">🏛️ Hà Nội</SelectItem>
                  <SelectItem value="Danang">🏖️ Đà Nẵng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ngân sách (VNĐ)</Label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bắt đầu (giờ)</Label>
                <Input
                  type="number"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Kết thúc (giờ)</Label>
                <Input
                  type="number"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phong cách</Label>
              <Select value={pace} onValueChange={setPace}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">⚡ Nhanh</SelectItem>
                  <SelectItem value="normal">🚶 Bình thường</SelectItem>
                  <SelectItem value="slow">☕ Thong thả</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={runAlgorithm}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                "Đang chạy..."
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Chạy thuật toán
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* CỘT PHẢI: Kết quả */}
        <div className="space-y-6">
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Kết quả
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-1">
                          Thời gian
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {executionTime.toFixed(2)}s
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-1">
                          Địa điểm
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {result.location_count}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="col-span-2">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-1">
                          Tổng chi phí
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {result.total_cost.toLocaleString()} đ
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Danh sách địa điểm</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] p-6">
                    <div className="space-y-2">
                      {result.itinerary.map((loc: any, index: number) => (
                        <Card key={loc.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <Badge className="mt-0.5">{index + 1}</Badge>
                              <div className="flex-1">
                                <p className="font-bold text-sm">{loc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {loc.price.toLocaleString()} đ •{" "}
                                  {loc.time_visit} phút • ⭐ {loc.rating}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}

          {!result && !loading && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-[400px] p-8 text-center">
                <Play className="w-16 h-16 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">Chưa có kết quả</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Điều chỉnh tham số và nhấn "Chạy thuật toán"
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[400px] p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Đang chạy thuật toán...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
