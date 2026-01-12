"use client";

import { useState, useEffect } from "react";
import { History, Trash2, MapPin, Clock, Wallet, Calendar } from "lucide-react";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
});

interface Location {
  id: number;
  name: string;
  city: string;
  price: number;
  category: string;
  time_visit: number;
  rating: number;
  lat: number;
  lng: number;
}

interface ItineraryResult {
  itinerary: Location[];
  total_cost: number;
  total_duration_minutes: number;
  location_count: number;
}

interface HistoryItem {
  query: {
    city: string;
    budget: number;
    start_time: number;
    end_time: number;
    pace: string;
  };
  result: ItineraryResult;
  timestamp: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // Load lịch sử từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("travel_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Xóa toàn bộ lịch sử
  const clearHistory = () => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ lịch sử?")) {
      localStorage.removeItem("travel_history");
      setHistory([]);
      setSelectedItem(null);
    }
  };

  // Xóa 1 item
  const deleteItem = (timestamp: number) => {
    const newHistory = history.filter((item) => item.timestamp !== timestamp);
    localStorage.setItem("travel_history", JSON.stringify(newHistory));
    setHistory(newHistory);
    if (selectedItem?.timestamp === timestamp) {
      setSelectedItem(null);
    }
  };

  // Format thời gian
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTime = (startHour: number, minutesToAdd: number) => {
    const totalMinutes = startHour * 60 + minutesToAdd;
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
            <History className="w-10 h-10" />
            Lịch sử tìm kiếm
          </h1>
          <p className="text-gray-600">
            Xem lại các lịch trình đã tạo trước đó
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Nội dung */}
      {history.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-dashed border-gray-300">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-400 mb-2">
            Chưa có lịch sử
          </h2>
          <p className="text-gray-500 mb-6">
            Hãy tạo lịch trình đầu tiên của bạn!
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition"
          >
            Lập kế hoạch ngay
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách lịch sử */}
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh+100px)] overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.timestamp}
                onClick={() => setSelectedItem(item)}
                className={`
                  bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all border-2
                  ${
                    selectedItem?.timestamp === item.timestamp
                      ? "border-blue-500 shadow-lg"
                      : "border-transparent hover:border-blue-200"
                  }
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {item.query.city === "Hanoi" ? "Hà Nội" : "Đà Nẵng"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(item.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.timestamp);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Wallet className="w-4 h-4 text-green-600" />
                    <span>{item.query.budget.toLocaleString()} đ</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>
                      {item.query.start_time}h - {item.query.end_time}h
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>{item.result.location_count} địa điểm</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Chi phí:{" "}
                    <span className="font-bold text-green-600">
                      {item.result.total_cost.toLocaleString()} đ
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Chi tiết lịch trình */}
          <div className="lg:col-span-2">
            {!selectedItem ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-dashed border-gray-300 h-full flex flex-col items-center justify-center">
                <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Chọn một lịch sử bên trái để xem chi tiết
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timeline */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-h-[400px] overflow-y-auto">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 sticky top-0 z-10 bg-white p-6 border-b">
                    Lịch trình chi tiết
                  </h2>
                  <div className="relative border-l-2 border-gray-300 ml-4 space-y-6 pl-5">
                    {selectedItem.result.itinerary.map((loc, index) => {
                      const accumulatedVisitTime = selectedItem.result.itinerary
                        .slice(0, index)
                        .reduce((sum, item) => sum + item.time_visit, 0);
                      const arrivalTime = calculateTime(
                        selectedItem.query.start_time,
                        accumulatedVisitTime
                      );
                      return (
                        <div key={loc.id} className="relative">
                          <div className="absolute -left-9 top-1 w-8 h-8 bg-black rounded-full border-4 border-white shadow-sm flex items-center justify-center text-sm text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="bg-gray-50 hover:bg-blue-50 transition p-4 rounded-lg border border-gray-200">
                            <span className="text-sm font-bold flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3" /> {arrivalTime}
                            </span>
                            <h3 className="text-sm font-bold text-gray-800">
                              {loc.name}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {loc.price.toLocaleString()} đ • {loc.time_visit}{" "}
                              phút
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bản đồ */}
                <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-100 h-[400px]">
                  <MapWithNoSSR
                    locations={selectedItem.result.itinerary}
                    center={[
                      selectedItem.result.itinerary[0]?.lat || 21.0285,
                      selectedItem.result.itinerary[0]?.lng || 105.8542,
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
