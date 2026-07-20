import { useState, useEffect } from "react";

// Hàm xác định địa chỉ API dựa trên môi trường chạy
const layDiaChiAPI = () => {
  const tenMien = window.location.hostname;
  if (
    tenMien === "localhost" ||
    tenMien === "127.0.0.1" ||
    tenMien.startsWith("192.168.") ||
    tenMien.startsWith("10.")
  ) {
    return `http://${tenMien}:5004`;
  }
  return "http://14.225.192.252:5004";
};

export const API = layDiaChiAPI();

export const useChiTietBuoiHoc = (id: string | undefined) => {
  const [buoiHoc, setBuoiHoc] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"exercises" | "lectures" | "documents">("exercises");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "homework" | "exam" | "practice">("all");
  const [exercises, setExercises] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  // Tải thông tin chi tiết buổi học
  const taiThongTinBuoiHoc = () => {
    if (!id) return;
    fetch(`${API}/buoihoc/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBuoiHoc(data);
      })
      .catch((err) => console.error("Lỗi khi tải thông tin buổi học:", err));
  };

  // Tải danh sách bài tập của buổi học
  const taiDanhSachBaiTap = () => {
    if (!id) return;
    fetch(`${API}/baitap/buoihoc/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setExercises(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Lỗi khi tải danh sách bài tập:", err));
  };

  useEffect(() => {
    taiThongTinBuoiHoc();
    taiDanhSachBaiTap();
  }, [id]);

  // Xử lý mở/khóa đề thi kiểm tra thủ công
  const handleToggleOpen = async (maBaiTap: number) => {
    try {
      const res = await fetch(`${API}/baitap/toggle-open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBaiTap: maBaiTap }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExercises((prev: any[]) =>
          prev.map((ex: any) => {
            if (Number(ex.MaBaiTap) === Number(maBaiTap)) {
              let parsed: any = {};
              try {
                if (ex.Content) parsed = JSON.parse(ex.Content);
              } catch (e) {}
              const updatedContent = JSON.stringify({
                ...parsed,
                isOpened: data.isOpened,
              });
              return { ...ex, Content: updatedContent };
            }
            return ex;
          })
        );
      } else {
        alert("Lỗi: " + (data.message || "Không thể cập nhật trạng thái đóng/mở"));
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    }
  };

  // Xử lý xóa bài tập
  const handleDelete = async () => {
    if (selectedId === null) return;
    try {
      const url = `${API}/baitap/${selectedId}`;
      const res = await fetch(url, { method: "DELETE" });
      const body = await res.text();
      if (res.ok) {
        const cleanId = String(selectedId).replace("exam-", "").replace("baitap-", "");
        setExercises((prev: any[]) =>
          prev.filter((e: any) => String(e.MaBaiTap) !== cleanId)
        );
      } else {
        alert("Xóa thất bại: " + body);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    }
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  // Lọc danh sách bài tập theo ô tìm kiếm và dropdown lọc
  const filteredExercises = exercises.filter((ex: any) => {
    const matchesSearch = ex.Title?.toLowerCase().includes(exerciseSearch.toLowerCase());
    let parsedContent: any = {};
    try {
      if (ex.Content) parsedContent = JSON.parse(ex.Content);
    } catch (e) {}
    const isExam =
      ex.IsExam === 1 ||
      ex.Type === "exam" ||
      parsedContent.isExam ||
      ex.Title?.toLowerCase().includes("test") ||
      ex.Title?.toLowerCase().includes("kiểm tra");

    if (filterType === "homework") {
      return matchesSearch && !isExam && ex.TrangThai !== "practice";
    }
    if (filterType === "exam") {
      return matchesSearch && isExam && ex.TrangThai !== "practice";
    }
    if (filterType === "practice") {
      return matchesSearch && ex.TrangThai === "practice";
    }
    return matchesSearch;
  });

  // Sắp xếp bài tập: Bài tập (1) -> Luyện tập thêm (2) -> Kiểm tra (3)
  const sortedExercises = [...filteredExercises].sort((a: any, b: any) => {
    let parsedA: any = {};
    let parsedB: any = {};
    try { if (a.Content) parsedA = JSON.parse(a.Content); } catch (e) {}
    try { if (b.Content) parsedB = JSON.parse(b.Content); } catch (e) {}

    const isExamA = a.IsExam === 1 || a.Type === "exam" || parsedA.isExam || a.Title?.toLowerCase().includes("test") || a.Title?.toLowerCase().includes("kiểm tra");
    const isExamB = b.IsExam === 1 || b.Type === "exam" || parsedB.isExam || b.Title?.toLowerCase().includes("test") || b.Title?.toLowerCase().includes("kiểm tra");

    const isPracticeA = a.TrangThai === "practice";
    const isPracticeB = b.TrangThai === "practice";

    const scoreA = isExamA ? 3 : isPracticeA ? 2 : 1;
    const scoreB = isExamB ? 3 : isPracticeB ? 2 : 1;

    return scoreA - scoreB;
  });

  return {
    buoiHoc,
    activeTab,
    setActiveTab,
    exerciseSearch,
    setExerciseSearch,
    filterType,
    setFilterType,
    filteredExercises: sortedExercises,
    showDeleteModal,
    setShowDeleteModal,
    setSelectedId,
    handleToggleOpen,
    handleDelete,
  };
};
