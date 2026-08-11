import { ref } from "vue";
import axios from "@/api/axios";

interface ProductInfo {
  itemId: number;
  productName: string;
  shopName: string;
  price: number;
  sales: number;
  imageUrl: string;
  productLink: string;
  rating: string;
  commission: number;
  sellerComFinal: number;
  shopeeComFinal: number;
  isXtra: boolean;
  hasSellerCommission: boolean;
  hasShopeeCommission: boolean;
  isCapped: boolean;
  isLimitCap: boolean;
  cap: number;
  capRaw: number;
  capAfterRate: number;
  lastUpdate: string;
  dataSource: string;
  priceStats?: {
    currentPrice: number;
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    priceChange7d: number;
    priceChange30d: number;
    lastPriceUpdate: string;
    lowestPriceDate: string | null;
    highestPriceDate: string | null;
  };
  latestPriceHistory?: {
    price: number;
    originalPrice: number;
    discountPercent: number;
    currency: string;
    flashSale: boolean;
    promotionId: string | null;
    stockAvailable: number;
    recordedDate: string;
    recordedTime: string;
  };
  commission_min_rate?: number;
  commission_max_rate?: number;
}

interface ConvertResponse {
  success?: boolean;
  shortLink?: string;
  affiliateLink?: string;
  data?: {
    shortLink?: string;
  };
  productInfo?: ProductInfo;
  message?: string;
}

export function useShopeeApi() {
  const resultLink = ref<string>("");
  const affiliateLink = ref<string>("");
  const productInfo = ref<ProductInfo | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Validation function for Shopee link formats
  const validateShopeeUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;
    const shopeeRegex = /(shopee\.vn|shp\.ee|shope\.ee|shopee\.co\.id|shopee\.sg)/i;
    return shopeeRegex.test(url);
  };

  // Validation function for TikTok link formats
  const validateTiktokUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;
    const tiktokRegex = /(tiktok\.com|vt\.tiktok\.com|v\.tiktok\.com)/i;
    return tiktokRegex.test(url);
  };

  // Validation function for Lazada link formats
  const validateLazadaUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;
    const lazadaRegex = /(lazada\.vn|s\.lazada\.vn)/i;
    return lazadaRegex.test(url);
  };

  // Validation function for ShopeeFood link formats
  const validateShopeeFoodUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;
    const shopeeFoodRegex = /(spf\.shopee\.vn|shopeefood\.vn|shopeefood\.shopee\.vn)/i;
    return shopeeFoodRegex.test(url);
  };

  const convertUrl = async (rawUrl: string, type?: number) => {
    // Reset states
    resultLink.value = "";
    affiliateLink.value = "";
    error.value = null;

    const trimmedUrl = rawUrl.trim();

    // Validate link based on platform type
    if (type === 2) {
      if (!validateTiktokUrl(trimmedUrl)) {
        error.value = "Vui lòng nhập đường dẫn TikTok hợp lệ! (Ví dụ: tiktok.com/... hoặc vt.tiktok.com/...)";
        return false;
      }
    } else if (type === 3) {
      if (!validateLazadaUrl(trimmedUrl)) {
        error.value = "Vui lòng nhập đường dẫn Lazada hợp lệ! (Ví dụ: lazada.vn/... hoặc s.lazada.vn/...)";
        return false;
      }
    } else if (type === 4) {
      if (!validateShopeeFoodUrl(trimmedUrl)) {
        error.value = "Vui lòng nhập đường dẫn ShopeeFood hợp lệ! (Ví dụ: shopeefood.vn/...)";
        return false;
      }
    } else {
      if (!validateShopeeUrl(trimmedUrl)) {
        error.value = "Vui lòng nhập đường dẫn Shopee hợp lệ! (Ví dụ: shopee.vn/... hoặc shp.ee/...)";
        return false;
      }
    }

    isLoading.value = true;

    try {
      // Formulate request payload
      const payload: Record<string, any> = {
        originalLink: trimmedUrl,
      };

      if (type && type !== 1) {
        payload.type = type;
      }

      const response = await axios.post<ConvertResponse>("/link/convert", payload);

      const responseData = response.data;

      // Flexible extraction to handle various response structures
      const dataObj = responseData.data || responseData;
      const extractedShortLink = dataObj.shortLink;
      const extractedLongLink = dataObj.affiliateLink || dataObj.longLink;

      if (extractedShortLink || extractedLongLink) {
        resultLink.value = extractedShortLink || extractedLongLink || "";
        affiliateLink.value = extractedLongLink || extractedShortLink || "";
        productInfo.value = dataObj.productInfo || null;
        return true;
      } else {
        throw new Error(responseData.message || "Không thể lấy được link từ máy chủ.");
      }
    } catch (err: any) {
      console.error("API error:", err);

      let errMsg = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau!";

      if (err?.response) {
        const status = err.response.status;
        const responseData = err.response.data;
        const responseMessage = responseData?.message || "";

        if (
          responseMessage.toLowerCase().includes("internal server error") ||
          err.message?.toLowerCase().includes("internal server error")
        ) {
          errMsg = "Đã xảy ra lỗi, vui lòng thử lại hoặc sử dụng link sản phẩm khác";
        } else if (status === 500) {
          errMsg = "Đã xảy ra lỗi, vui lòng thử lại hoặc sử dụng link sản phẩm khác";
        } else if (status === 404) {
          errMsg = "Không tìm thấy máy chủ xử lý quy đổi. Vui lòng liên hệ quản trị viên!";
        } else if (status === 400 || status === 422) {
          errMsg = responseMessage || "Đường dẫn sản phẩm không hợp lệ hoặc không được hỗ trợ.";
        } else {
          errMsg = responseMessage || err.message || "Đã xảy ra lỗi không xác định trong quá trình xử lý.";
        }
      } else if (err?.message) {
        errMsg = err.message;
      }

      if (errMsg.toLowerCase().includes("internal server error")) {
        errMsg = "Đã xảy ra lỗi, vui lòng thử lại hoặc sử dụng link sản phẩm khác";
      }

      if (
        errMsg === "Đã xảy ra lỗi, vui lòng thử lại hoặc sử dụng link sản phẩm khác"
      ) {
        error.value = errMsg;
      } else if (
        errMsg === err?.message ||
        (err?.response && (err.response.status === 400 || err.response.status === 422))
      ) {
        error.value = `Lỗi: ${errMsg}`;
      } else {
        error.value = errMsg;
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const clearStates = () => {
    resultLink.value = "";
    affiliateLink.value = "";
    productInfo.value = null;
    error.value = null;
    isLoading.value = false;
  };

  return {
    resultLink,
    affiliateLink,
    productInfo,
    isLoading,
    error,
    convertUrl,
    clearStates,
    validateShopeeUrl,
    validateTiktokUrl,
    validateLazadaUrl,
    validateShopeeFoodUrl,
  };
}
