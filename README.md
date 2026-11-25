# CEO Digital Card 5.0 – Bao Bì Tuấn Tú

Website danh thiếp điện tử (namecard) cho CEO Bao Bì Tuấn Tú.

**Xem trực tuyến:** https://trungtoanit.github.io/namecard/

## Tính năng
- Video nhà máy toàn màn hình (hiện dùng mô phỏng chuyển động, có nút chọn video)
- Thẻ NFC kim loại 3D: chạm để lật 180°, nghiêng theo chuột/cảm biến điện thoại, ánh kim
- 3 ngôn ngữ: Tiếng Việt · English · 中文
- Nút Gọi, Zalo, WeChat (QR), Email, Website, Chia sẻ, Lưu danh bạ (vCard)
- Hồ sơ năng lực, Digital Showroom 6 sản phẩm với hiệu ứng vẽ nét, viền vàng chạy, pháo hoa hạt vàng
- Slogan 3 ngôn ngữ xoay vòng, tự nhận diện ngôn ngữ trình duyệt (ép ngôn ngữ bằng ?lang=vi|en|zh)

## Cập nhật dữ liệu thật
Sửa object `CONFIG` ở đầu thẻ `<script>` trong `index.html`, và nội dung `I18N` cho từng ngôn ngữ.
Đặt ảnh/video vào thư mục `assets/`.

Thông tin còn thiếu:
- [x] Logo chính thức (file gốc, tông vàng đồng: `assets/logo-gold.png`)
- [x] Ảnh chân dung CEO
- [x] Họ tên và chức danh chính thức
- [x] Số điện thoại (Zalo đang dùng chung số – cần xác nhận)
- [ ] Mã QR / ID WeChat
- [x] Email doanh nghiệp
- [x] Địa chỉ nhà máy
- [ ] Hình ảnh và video nhà máy
- [x] Số liệu năng lực
- [ ] Danh mục sản phẩm, catalogue
- [x] Tên miền chính thức

## QR chia sẻ namecard
- Ảnh in ấn: `assets/qr-namecard.png` (1000×1250)
- Trang poster: https://trungtoanit.github.io/namecard/qr.html (thêm `?lang=en` hoặc `?lang=zh`)
- Quét QR → https://trungtoanit.github.io/namecard/
