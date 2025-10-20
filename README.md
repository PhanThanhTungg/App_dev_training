# Tung Training - Shopify App

## 📖 Mô tả

Tung Training là một ứng dụng Shopify được phát triển nhằm mục đích học tập và thực hành trong giai đoạn training tại BSS Group

## ✨ Tính năng chính

### 🛍️ Quản lý sản phẩm
- **Xem danh sách sản phẩm**: Hiển thị danh sách sản phẩm với phân trang
- **Lọc và tìm kiếm**: Tìm kiếm sản phẩm có debounce, filter sản phẩm đa tiêu chí
- **Chỉnh sửa sản phẩm**: Cập nhật thông tin sản phẩm trực tiếp
- **Xóa sản phẩm**: Xóa sản phẩm với xác nhận an toàn
- **Hành động hàng loạt**: Thực hiện các thao tác trên nhiều sản phẩm cùng lúc

### 🎨 Theme Extension
- **Product Info Button**: Thêm nút thông tin sản phẩm vào theme
- **Product Info Modal**: Hiển thị popup thông tin chi tiết sản phẩm và tên dev
- **Tùy chỉnh giao diện**: CSS và JavaScript tùy chỉnh cho theme

## 🛠️ Công nghệ sử dụng

### Frontend
- **React**: Thư viện JavaScript cho UI
- **React Router**: Routing cho ứng dụng React
- **Shopify Polaris**: Hệ thống thiết kế của Shopify
- **TailwindCSS**: Framework CSS utility-first

### Backend
- **Shopify Admin API**: Tương tác với dữ liệu Shopify

## 🚀 Cài đặt và chạy dự án

### 1. Clone repository
```bash
git clone https://github.com/PhanThanhTungg/App_dev_training.git
cd tung-traning
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Thiết lập database
```bash
npm run setup
```

### 4. Khởi chạy development server
```bash
npm run dev
```

### 5. Deploy ứng dụng
```bash
npm run deploy
```

## 📁 Cấu trúc dự án

```
tung-traning/
├── app/                           # Source code chính
│   ├── components/                # React components
│   │   └── products/             # Components quản lý sản phẩm
│   ├── routes/                   # Route handlers
│   │   ├── app.products/         # Routes sản phẩm
│   │   └── auth.$/              # Authentication routes
│   ├── models/                   # Data models
│   ├── graphqlActions/           # GraphQL queries & mutations
│   ├── utils/                    # Utility functions
│   └── styles/                   # CSS files
├── extensions/                   # Shopify theme extensions
│   └── tung-training-team-h/     # Theme extension
├── prisma/                       # Database schema & migrations
├── public/                       # Static assets
└── config files                  # Các file cấu hình
```

## 🐛 Báo lỗi

Nếu bạn gặp lỗi hoặc có đề xuất, vui lòng tạo issue trên GitHub repository.

## 📄 License

Dự án này được phát triển cho mục đích học tập và training.

## 👥 Tác giả

- **Phan Thanh Tùng** - *Initial work* - [PhanThanhTungg](https://github.com/PhanThanhTungg)

**Happy Coding! 🚀**
