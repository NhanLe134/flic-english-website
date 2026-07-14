import { useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu BuoiHoc tương ứng với cơ sở dữ liệu
export interface BuoiHoc {
  MaBuoiHoc: number;
  TenBuoiHoc: string;
  MoTa: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  ThuTu: number;
  TrangThai?: string;
}

// Hàm xác định địa chỉ API động dựa trên môi trường chạy
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

export const useDanhSachBuoiHoc = (maLopHoc: string | undefined) => {
  const [cacBuoiHoc, setCacBuoiHoc] = useState<BuoiHoc[]>([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [hienThiModalThem, setHienThiModalThem] = useState(false);
  const [trangThaiLopHoc, setTrangThaiLopHoc] = useState<string>("");

  // State lưu thông tin form thêm buổi học mới
  const [formBuoiHoc, setFormBuoiHoc] = useState({
    title: "",
    desc: "",
    startDate: "",
    endDate: "",
    order: 1,
  });

  // State điều khiển hộp thoại thông báo/xác nhận tùy chỉnh
  const [hopThoai, setHopThoai] = useState<{
    show: boolean;
    type: "confirm" | "alert";
    message: string;
    subMessage?: string;
    onConfirm?: () => void;
  }>({
    show: false,
    type: "alert",
    message: "",
  });

  // Hàm tải danh sách buổi học và thông tin lớp học từ API
  const taiDuLieu = () => {
    if (!maLopHoc) return;

    fetch(`${API}/classes/${maLopHoc}/buoihoc`)
      .then((r) => r.json())
      .then((data) => setCacBuoiHoc(data))
      .catch((err) => console.error("Lỗi khi tải danh sách buổi học:", err));

    fetch(`${API}/classes/${maLopHoc}/info`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.TrangThaiLopHoc) {
          setTrangThaiLopHoc(data.TrangThaiLopHoc);
        }
      })
      .catch((err) => console.error("Lỗi khi tải thông tin lớp học:", err));
  };

  // Tự động tải lại dữ liệu khi mã lớp học thay đổi
  useEffect(() => {
    taiDuLieu();
  }, [maLopHoc]);

  // Hiển thị thông báo Alert
  const hienThiThongBao = (message: string) => {
    setHopThoai({
      show: true,
      type: "alert",
      message,
    });
  };

  // Hiển thị thông báo Xác nhận hành động (Confirm)
  const hienThiXacNhan = (message: string, subMessage: string, onConfirm: () => void) => {
    setHopThoai({
      show: true,
      type: "confirm",
      message,
      subMessage,
      onConfirm,
    });
  };

  // Đóng hộp thoại
  const dongHopThoai = () => {
    setHopThoai((p) => ({ ...p, show: false }));
  };

  // Xử lý xóa một buổi học
  const xuLyXoaBuoiHoc = (maBuoiHoc: number, tenBuoiHoc: string) => {
    hienThiXacNhan(
      `Bạn có chắc chắn muốn xóa buổi học "${tenBuoiHoc}" không?`,
      "Tất cả tài liệu, bài giảng, và bài tập liên kết với buổi này sẽ bị ảnh hưởng.",
      async () => {
        try {
          const res = await fetch(`${API}/qtv/buoihoc/${maBuoiHoc}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setCacBuoiHoc((prev) => prev.filter((b) => b.MaBuoiHoc !== maBuoiHoc));
          } else {
            hienThiThongBao("Lỗi khi xóa buổi học từ máy chủ.");
          }
        } catch (err) {
          console.error(err);
          hienThiThongBao("Lỗi kết nối mạng khi thực hiện xóa buổi học.");
        }
      }
    );
  };

  // Cập nhật trạng thái buổi học đang hoạt động (đang học)
  const xuLyCapNhatBuoiHocDangHoc = async (maBuoiHoc: number | null) => {
    try {
      const res = await fetch(`${API}/classes/${maLopHoc}/active-buoihoc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeBuoiHocId: maBuoiHoc }),
      });
      if (res.ok) {
        // Tải lại danh sách để cập nhật trạng thái hiển thị ngay lập tức
        taiDuLieu();
      } else {
        hienThiThongBao("Không thể cập nhật trạng thái buổi học đang hoạt động.");
      }
    } catch (err) {
      console.error(err);
      hienThiThongBao("Lỗi kết nối khi cập nhật trạng thái hoạt động.");
    }
  };

  // Mở modal thêm buổi học và khởi tạo số thứ tự mặc định
  const moModalThemBuoiHoc = () => {
    setFormBuoiHoc({
      title: "",
      desc: "",
      startDate: "",
      endDate: "",
      order: cacBuoiHoc.length > 0 ? cacBuoiHoc.length + 1 : 1,
    });
    setHienThiModalThem(true);
  };

  // Lưu buổi học mới được tạo
  const luuBuoiHocMoi = async () => {
    if (!formBuoiHoc.title.trim()) {
      hienThiThongBao("Vui lòng nhập đầy đủ tên buổi học!");
      return;
    }
    const thuTuToiThieu = Math.max(1, cacBuoiHoc.length);
    if (formBuoiHoc.order < thuTuToiThieu) {
      hienThiThongBao(`Thứ tự buổi học không được nhỏ hơn số buổi hiện có ở lớp này (${cacBuoiHoc.length})!`);
      return;
    }
    try {
      const res = await fetch(`${API}/qtv/buoihoc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TenBuoiHoc: formBuoiHoc.title,
          MaLopHoc: Number(maLopHoc),
          MoTa: formBuoiHoc.desc,
          NgayBatDau: formBuoiHoc.startDate || null,
          NgayKetThuc: formBuoiHoc.endDate || null,
          ThuTu: formBuoiHoc.order,
        }),
      });
      if (res.ok) {
        setHienThiModalThem(false);
        setFormBuoiHoc({
          title: "",
          desc: "",
          startDate: "",
          endDate: "",
          order: 1,
        });
        taiDuLieu(); // Tải lại danh sách
      } else {
        hienThiThongBao("Gặp lỗi khi tạo mới buổi học.");
      }
    } catch (err) {
      console.error(err);
      hienThiThongBao("Lỗi máy chủ khi thêm buổi học.");
    }
  };

  // Lọc danh sách buổi học theo từ khóa tìm kiếm và sắp xếp giảm dần theo số thứ tự buổi học (ThuTu) để không bị lộn xộn
  const danhSachLoc = cacBuoiHoc
    .filter((b) => b.TenBuoiHoc.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()))
    .sort((a, b) => b.ThuTu - a.ThuTu);

  return {
    cacBuoiHoc,
    danhSachLoc,
    tuKhoaTimKiem,
    setTuKhoaTimKiem,
    hienThiModalThem,
    setHienThiModalThem,
    trangThaiLopHoc,
    formBuoiHoc,
    setFormBuoiHoc,
    hopThoai,
    dongHopThoai,
    xuLyXoaBuoiHoc,
    xuLyCapNhatBuoiHocDangHoc,
    moModalThemBuoiHoc,
    luuBuoiHocMoi,
  };
};
