"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Wallet,
  Search,
  ArrowRight,
  Loader2,
  MapPin,
  CheckCircle2,
  NotebookPen,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

// Import MapComponent tắt SSR
const MapWithNoSSR = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted animate-pulse rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

// Định nghĩa kiểu dữ liệu
interface Location {
  id: number;
  name: string;
  city: string;
  price: number;
  category: string;
  time_visit: number; // phút
  rating: number;
  lat: number;
  lng: number;
}

interface ItineraryResult {
  itinerary: Location[];
  total_cost: number;
  total_duration_minutes: number;
}

export default function Home() {
  // State cho Form
  const [budget, setBudget] = useState(500000);
  const [startTime, setStartTime] = useState(8); // 8h sáng
  const [endTime, setEndTime] = useState(18); // 18h tối
  const [city, setCity] = useState("Hanoi");
  const [pace, setPace] = useState("normal");
  const [startPoint, setStartPoint] = useState<string>("none");
  const [mustVisit, setMustVisit] = useState<number[]>([]);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);

  // State cho tìm kiếm trong dropdown
  const [searchStart, setSearchStart] = useState("");
  const [searchMustVisit, setSearchMustVisit] = useState("");

  // State cho Kết quả
  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch địa điểm khi đổi thành phố
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`http://localhost:8000/locations/${city}`);
        const data = await res.json();
        setAvailableLocations(data);
        // Reset lựa chọn khi đổi thành phố
        setStartPoint("none");
        setMustVisit([]);
      } catch (error) {
        console.error("Lỗi fetch locations:", error);
      }
    };
    fetchLocations();
  }, [city]);

  // Hàm gọi API
  const handleOptimize = async () => {
    setLoading(true);
    setResult(null);

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
          start_point_id: startPoint === "none" ? null : Number(startPoint),
          must_visit_ids: mustVisit,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setResult(data.result);

        // Lưu vào lịch sử
        const historyItem = {
          query: {
            city,
            budget,
            start_time: startTime,
            end_time: endTime,
            pace,
            start_point_id: startPoint === "none" ? null : Number(startPoint),
            must_visit_ids: mustVisit,
          },
          result: data.result,
          timestamp: Date.now(),
        };

        const history = JSON.parse(
          localStorage.getItem("travel_history") || "[]"
        );
        history.unshift(historyItem);
        localStorage.setItem(
          "travel_history",
          JSON.stringify(history.slice(0, 10))
        );
      } else {
        const errorMsg =
          data.message || data.detail?.[0]?.msg || "Lỗi không xác định";
        alert("Có lỗi: " + errorMsg);
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm tiện ích: Cộng giờ để hiển thị timeline
  const calculateTime = (startHour: number, minutesToAdd: number) => {
    const totalMinutes = startHour * 60 + minutesToAdd;
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: "🍜",
      history: "🏛️",
      culture: "🎭",
      nature: "🌳",
      beach: "🏖️",
      entertainment: "🎢",
    };
    return icons[category] || "📍";
  };

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
          <NotebookPen className="w-10 h-10" />
          Lập kế hoạch du lịch mới
        </h1>
        <p className="text-muted-foreground">
          Nhập thông tin chuyến đi và để hệ thống tối ưu lịch trình cho bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Thiết lập chuyến đi
            </CardTitle>
            <CardDescription>
              Điền thông tin để tìm lịch trình tối ưu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chọn thành phố */}
            <div className="space-y-2">
              <Label htmlFor="city">Thành phố</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Chọn thành phố" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hanoi">🏛️ Hà Nội</SelectItem>
                  <SelectItem value="Danang">🏖️ Đà Nẵng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chọn phong cách đi */}
            <div className="space-y-2">
              <Label htmlFor="pace">Phong cách đi</Label>
              <Select value={pace} onValueChange={setPace}>
                <SelectTrigger id="pace">
                  <SelectValue placeholder="Chọn phong cách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">
                    ⚡ Nhanh (Cưỡi ngựa xem hoa)
                  </SelectItem>
                  <SelectItem value="normal">🚶 Bình thường</SelectItem>
                  <SelectItem value="slow">
                    ☕ Thong thả (Ngắm nghía kỹ)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* --- TÙY CHỌN NÂNG CAO --- */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Tùy chọn địa điểm
              </h3>

              {/* Điểm bắt đầu */}
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="start-point">
                  Điểm xuất phát (không bắt buộc)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      {startPoint === "none"
                        ? "Ngẫu nhiên (Tự động)"
                        : availableLocations.find(
                            (loc) => loc.id.toString() === startPoint
                          )?.name || "Chọn điểm bắt đầu"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Tìm địa điểm..." />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy địa điểm.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              setStartPoint("none");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                startPoint === "none"
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            Ngẫu nhiên (Tự động)
                          </CommandItem>
                          {availableLocations.map((loc) => (
                            <CommandItem
                              key={loc.id}
                              value={loc.name}
                              onSelect={() => {
                                setStartPoint(loc.id.toString());
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  startPoint === loc.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {getCategoryIcon(loc.category)} {loc.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Điểm bắt buộc */}
              <div className="space-y-2">
                <Label>Địa điểm bắt buộc phải đi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                      {mustVisit.length > 0
                        ? `Đã chọn ${mustVisit.length} địa điểm`
                        : "Chọn các điểm ưu tiên"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Tìm địa điểm..." />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy địa điểm.</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-72">
                            {availableLocations.map((loc) => (
                              <CommandItem
                                key={loc.id}
                                value={loc.name}
                                onSelect={() => {
                                  if (mustVisit.includes(loc.id)) {
                                    setMustVisit(
                                      mustVisit.filter((id) => id !== loc.id)
                                    );
                                  } else {
                                    setMustVisit([...mustVisit, loc.id]);
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-2 w-full">
                                  <Checkbox
                                    id={`must-visit-${loc.id}`}
                                    checked={mustVisit.includes(loc.id)}
                                    className="pointer-events-none"
                                  />
                                  <span className="text-sm font-medium leading-none cursor-pointer">
                                    {loc.name}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {mustVisit.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mustVisit.map((id) => {
                      const loc = availableLocations.find((l) => l.id === id);
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="text-[10px] py-0 px-2"
                        >
                          {loc?.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Ngân sách */}
            <div className="space-y-2">
              <Label htmlFor="budget">Ngân sách tối đa (VNĐ)</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  className="pl-10"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Bắt đầu (giờ)</Label>
                <Input
                  id="start-time"
                  type="number"
                  min="0"
                  max="23"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Kết thúc (giờ)</Label>
                <Input
                  id="end-time"
                  type="number"
                  min="0"
                  max="23"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                />
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleOptimize}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tính toán...
                </>
              ) : (
                <>
                  Lập kế hoạch ngay
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* CỘT PHẢI: KẾT QUẢ TIMELINE */}
        <div className="md:col-span-2 space-y-6">
          {loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 p-6">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  Đang tìm kiếm lộ trình tối ưu nhất...
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && !result && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-64 p-8 text-center">
                <Search className="w-16 h-16 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">Chưa có lịch trình</CardTitle>
                <p className="text-muted-foreground">
                  Hãy nhập thông tin và bấm nút bên trái!
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CỘT 1: TIMELINE */}
              <Card>
                <CardHeader className="sticky top-0 bg-card z-10 border-b">
                  <CardTitle>Lịch trình chi tiết</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    Tổng chi phí:{" "}
                    <Badge variant="secondary" className="text-base">
                      {result.total_cost.toLocaleString()} đ
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px] p-6">
                    <div className="relative border-l-2 border-primary/20 ml-4 space-y-8 pl-8 pb-4">
                      {result.itinerary.map((loc, index) => {
                        const accumulatedVisitTime = result.itinerary
                          .slice(0, index)
                          .reduce((sum, item) => sum + item.time_visit, 0);
                        const arrivalTime = calculateTime(
                          startTime,
                          accumulatedVisitTime
                        );
                        return (
                          <div key={loc.id} className="relative group">
                            <div className="absolute -left-[48px] top-1 w-8 h-8 bg-primary rounded-full border-4 border-card shadow-sm flex items-center justify-center text-sm text-primary-foreground font-bold">
                              {index + 1}
                            </div>
                            <Card className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      <Clock className="w-3 h-3 mr-1" />{" "}
                                      {arrivalTime}
                                    </Badge>
                                    {index === 0 && (
                                      <Badge
                                        variant="default"
                                        className="text-[10px] bg-blue-500 hover:bg-blue-600"
                                      >
                                        Điểm xuất phát
                                      </Badge>
                                    )}
                                    {mustVisit.includes(loc.id) && (
                                      <Badge
                                        variant="default"
                                        className="text-[10px] bg-green-500 hover:bg-green-600"
                                      >
                                        Bắt buộc
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-lg">
                                    {getCategoryIcon(loc.category)}
                                  </span>
                                </div>
                                <h3 className="font-bold mb-1">{loc.name}</h3>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Wallet className="w-3 h-3" />
                                    {loc.price.toLocaleString()} đ
                                  </span>
                                  <span>⭐ {loc.rating}</span>
                                  <span>{loc.time_visit} phút</span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* CỘT 2: BẢN ĐỒ */}
              <Card>
                <CardHeader>
                  <CardTitle>Bản đồ tương tác</CardTitle>
                  <CardDescription>
                    {result.itinerary.length} địa điểm được chọn
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="h-[600px] rounded-lg overflow-hidden">
                    <MapWithNoSSR
                      locations={result.itinerary}
                      center={
                        result.itinerary.length > 0
                          ? [result.itinerary[0].lat, result.itinerary[0].lng]
                          : city === "Hanoi"
                          ? [21.0285, 105.8542]
                          : [16.0544, 108.2022] // Đà Nẵng
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
