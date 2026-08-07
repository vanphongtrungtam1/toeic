# TOEIC Result Lookup – CFL, Can Tho University

Trang tra cứu kết quả thi TOEIC dạng **GitHub Pages tĩnh**.

## Cấu trúc file – tất cả đặt ngang hàng ở thư mục gốc

Upload trực tiếp toàn bộ các file sau lên **root** của repository GitHub, không cần tạo thư mục con:

- `index.html` – trang tra cứu chính
- `styles.css` – giao diện responsive
- `app.js` – logic tra cứu và giải mã
- `data.js` – dữ liệu kết quả đã mã hóa
- `logo-cfl.jpg` – logo Trung tâm Ngoại ngữ
- `logo-35-years.jpg` – logo 35 năm
- `.nojekyll` – cấu hình GitHub Pages
- `README.md` – hướng dẫn

## Đưa lên GitHub Pages

1. Tạo repository mới trên GitHub.
2. Chọn **Add file → Upload files**.
3. Kéo thả **tất cả các file trong ZIP này cùng một lần** vào repository. Không tạo folder `assets` hay folder dự án.
4. Commit vào nhánh `main`.
5. Vào **Settings → Pages**.
6. Chọn **Deploy from a branch**.
7. Chọn `main` và `/ (root)`, sau đó **Save**.

## Tra cứu

Thí sinh chọn đợt thi và nhập **CCCD / ID Number** đã đăng ký. Kết quả hiển thị các thông tin cần thiết gồm họ tên, ngày thi, Listening, Reading, Total Score và Proficiency Levels / Training Levels.

## Lưu ý bảo mật

GitHub Pages là nền tảng tĩnh và công khai. Dữ liệu CCCD không được lưu ở dạng văn bản thuần trong `data.js`; hồ sơ được mã hóa và được giải mã trên trình duyệt khi người dùng nhập đúng CCCD/ID. Nếu dùng làm cổng công bố chính thức với yêu cầu bảo mật cao, nên chuyển phần tra cứu sang backend/API có kiểm soát truy cập, rate limiting và logging.
