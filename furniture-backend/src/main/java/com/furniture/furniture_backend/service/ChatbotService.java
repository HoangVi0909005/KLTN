package com.furniture.furniture_backend.service;

import com.furniture.furniture_backend.dto.ChatRequest;
import com.furniture.furniture_backend.dto.ChatResponse;
import com.furniture.furniture_backend.dto.ProductResponse;
import com.furniture.furniture_backend.entity.ChatMessage;
import com.furniture.furniture_backend.entity.Product;
import com.furniture.furniture_backend.repository.ChatRepository;
import com.furniture.furniture_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final ChatRepository chatRepository;
    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    /**
     * Xử lý tin nhắn chính
     */
    public ChatResponse processChat(ChatRequest request) {
        try {
            log.info("📩 Processing chat for session: {}", request.getSessionId());

            // 1. Lấy context sản phẩm từ Database (Lấy 10 sản phẩm mới nhất làm mẫu tư vấn)
            List<Product> sampleProducts = productRepository.findAll().stream()
                    .limit(10)
                    .collect(Collectors.toList());

            // 2. Gọi Gemini để lấy câu trả lời thông minh (Xử lý được cả "Hi", "Speak
            // English", "Mày là ai")
            String aiResponseText = generateAiResponse(request.getMessage(), sampleProducts);

            // 3. Tìm sản phẩm thực tế để hiển thị dạng thẻ (Carousel) nếu tin nhắn liên
            // quan nội thất
            List<ProductResponse> suggestedProducts = findActualProducts(request.getMessage());

            // 4. Lưu vào Database
            saveChatMessage(request.getSessionId(), request.getMessage(), aiResponseText, request.getUserId());

            // 5. Trả về Response
            ChatResponse response = new ChatResponse();
            response.setResponse(aiResponseText);
            response.setSessionId(request.getSessionId());
            response.setTimestamp(LocalDateTime.now());
            if (!suggestedProducts.isEmpty()) {
                response.setSuggestedProducts(mapToProductSuggestions(suggestedProducts));
            }

            return response;
        } catch (Exception e) {
            log.error("❌ Error: ", e);
            return createErrorResponse(request.getSessionId());
        }
    }

    /**
     * Gọi Gemini API với Prompt thông minh
     */
    private String generateAiResponse(String userMessage, List<Product> products) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là trợ lý AI chuyên nghiệp của cửa hàng nội thất. ");
        prompt.append("Hành động: \n");
        prompt.append("- Nếu khách hỏi xã giao, chào hỏi, hãy trả lời tự nhiên, lịch sự.\n");
        prompt.append("- Nếu khách hỏi về nội thất, hãy dùng dữ liệu này để tư vấn: \n");
        for (Product p : products) {
            prompt.append(String.format("+ %s: giá %s đ\n", p.getName(), p.getPrice()));
        }
        prompt.append("\nQuy tắc: Trả lời ngắn gọn dưới 50 từ. Câu hỏi của khách: ").append(userMessage);

        try {
            String url = GEMINI_API_URL + geminiApiKey;
            Map<String, Object> body = Map.of("contents",
                    List.of(Map.of("parts", List.of(Map.of("text", prompt.toString())))));
            ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);

            List candidates = (List) response.getBody().get("candidates");
            Map content = (Map) ((Map) candidates.get(0)).get("content");
            List parts = (List) content.get("parts");
            return (String) ((Map) parts.get(0)).get("text");
        } catch (Exception e) {
            return "Xin chào! Tôi có thể giúp gì cho bạn về các mẫu nội thất mới nhất không?";
        }
    }

    /**
     * Tìm sản phẩm trong DB để map vào thẻ gợi ý
     */
    private List<ProductResponse> findActualProducts(String message) {
        String msg = message.toLowerCase();
        // Kiểm tra xem khách có đang hỏi về nội thất không
        if (msg.contains("bàn") || msg.contains("ghế") || msg.contains("sofa") || msg.contains("tủ")
                || msg.contains("giường")) {
            return productRepository.findAll().stream()
                    .filter(p -> msg.contains(p.getName().toLowerCase().split(" ")[0]))
                    .limit(3)
                    .map(this::mapToProductResponse)
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    // --- CÁC HÀM QUẢN LÝ LỊCH SỬ (ĐỂ CONTROLLER KHÔNG LỖI) ---

    public List<ChatMessage> getChatHistory(String sessionId) {
        return chatRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    public void clearChatHistory(String sessionId) {
        List<ChatMessage> messages = chatRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        chatRepository.deleteAll(messages);
    }

    private void saveChatMessage(String sessionId, String userMessage, String aiResponse, Long userId) {
        ChatMessage msg = new ChatMessage();
        msg.setSessionId(sessionId);
        msg.setMessage(userMessage);
        msg.setResponse(aiResponse);
        msg.setRole("user"); // Phân biệt role
        msg.setTimestamp(LocalDateTime.now());
        chatRepository.save(msg);
    }

    // --- CÁC HÀM MAPPING ---

    private ProductResponse mapToProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setImageUrls(product.getImageUrls());
        return response;
    }

    private List<ChatResponse.ProductSuggestion> mapToProductSuggestions(List<ProductResponse> products) {
        return products.stream().map(p -> new ChatResponse.ProductSuggestion(
                p.getId(), p.getName(), p.getPrice().toString(),
                (p.getImageUrls() != null && !p.getImageUrls().isEmpty()) ? p.getImageUrls().get(0) : null,
                null)).collect(Collectors.toList());
    }

    private ChatResponse createErrorResponse(String sessionId) {
        ChatResponse res = new ChatResponse();
        res.setResponse("Xin lỗi, hệ thống đang gặp chút sự cố. Bạn thử lại sau nhé!");
        res.setSessionId(sessionId);
        res.setTimestamp(LocalDateTime.now());
        return res;
    }
}