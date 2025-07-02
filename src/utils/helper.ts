const formatVND = (money: string) => {
  const number = Number(money);
  if (isNaN(number)) {
    return "Invalid number";
  }
  return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const formatDate2 = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const sanitizeContent = (html: string) => {
  return html.replace(/<img[^>]*>/g, "");
};

const renderCategory = (category: string) => {
  let result = "";
  switch (category) {
    case "Plastic":
      result = "Ép Plastic";
      break;
    case "Frame":
      result = "Khung Ảnh";
      break;
    case "Album":
      result = "Album";
      break;
    default:
      break;
  }
  return result;
};

const renderColor = (color: string) => {
  let result = "";
  switch (color) {
    case "black":
      result = "bg-black";
      break;
    case "white":
      result = "bg-white";
      break;
    case "gold":
      result = "bg-yellow-500";
      break;
    case "silver":
      result = "bg-gray-200";
      break;
    case "wood":
      result = "bg-yellow-900";
      break;
    default:
      break;
  }
  return result;
};

const renderColorText = (color: string) => {
  let result = "";
  switch (color) {
    case "black":
      result = "Đen";
      break;
    case "white":
      result = "Trắng";
      break;
    case "gold":
      result = "Vàng";
      break;
    case "silver":
      result = "Bạc";
      break;
    case "wood":
      result = "Gỗ";
      break;
    default:
      break;
  }
  return result;
};

const renderTag = (tag: string) => {
  let result = "";
  switch (tag) {
    case "frame":
      result = "Khung ảnh";
      break;
    case "printing":
      result = "In ấn";
      break;
    case "album":
      result = "Album";
      break;
    case "photo-care":
      result = "Chia Sẽ";
      break;
    case "digital-frame":
      result = "Khung digital";
      break;
    default:
      break;
  }
  return result;
};

const renderStatus = (status: string) => {
  let result = "";
  switch (status) {
    case "waiting":
      result = "Đợi phản hồi";
      break;
    case "pending":
      result = "Đang chuẩn bị đơn hàng";
      break;
    case "delivering":
      result = "Đang giao hàng";
      break;
    case "completed":
      result = "Hoàn thành";
      break;
    case "paid pending":
      result = "Đang chờ thanh toán";
      break;
    case "paid":
      result = "Đã thanh toán";
      break;
    case "cancelled":
      result = "Đã hủy đơn hàng";
      break;
    default:
      break;
  }
  return result;
};

const renderPayment = (method: string) => {
  let result = "";
  switch (method) {
    case "bank":
      result = "Ngân Hàng";
      break;
    case "momo":
      result = "Momo";
      break;
    case "cash":
      result = "Tiền Mặt";
      break;
    default:
      break;
  }
  return result;
};

const truncateText = (text: string, limit: number) => {
  if (text.length > limit) {
    return text.substring(0, limit) + "...";
  }
  return text;
};

const renderAlbumCover = (color: string) => {
  let result = "";
  switch (color) {
    case "bia-cung":
      result = "Bìa cứng";
      break;
    case "bia-da":
      result = "Bìa da";
      break;
    case "bia-goi":
      result = "Bìa gói";
      break;
    default:
      break;
  }
  return result;
};

const renderAlbumCore = (color: string) => {
  let result = "";
  switch (color) {
    case "can-mang":
      result = "Ruột cán màng";
      break;
    case "khong-can-mang":
      result = "Ruột không cán màng";
      break;
    case "trang-guong":
      result = "Ruột tráng gương";
      break;
    default:
      break;
  }
  return result;
};

export const HELPER = {
  formatVND,
  renderCategory,
  renderColor,
  renderColorText,
  renderTag,
  renderStatus,
  renderPayment,
  formatDate,
  formatDate2,
  truncateText,
  sanitizeContent,
  renderAlbumCover,
  renderAlbumCore,
};
