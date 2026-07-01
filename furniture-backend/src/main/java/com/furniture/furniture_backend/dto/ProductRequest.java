package com.furniture.furniture_backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 2, max = 200, message = "Tên sản phẩm phải từ 2 đến 200 ký tự")
    private String name;
    
    @NotBlank(message = "Mô tả không được để trống")
    private String description;
    
    @NotNull(message = "Giá sản phẩm không được để trống")
    @Positive(message = "Giá sản phẩm phải lớn hơn 0")
    private BigDecimal price;
    
    @Min(value = 0, message = "Giá giảm không được nhỏ hơn 0")
    private BigDecimal discountPrice;
    
    @NotNull(message = "Số lượng kho không được để trống")
    @Min(value = 0, message = "Số lượng kho phải từ 0 trở lên")
    private Integer stockQuantity;
    
    @NotNull(message = "Vui lòng chọn danh mục cho sản phẩm")
    private Long categoryId;
    
    @NotEmpty(message = "Phải có ít nhất một hình ảnh cho sản phẩm")
    private List<String> imageUrls;
    
    @NotBlank(message = "Vui lòng nhập chất liệu sản phẩm")
    private String material;
    
    @NotBlank(message = "Vui lòng nhập màu sắc sản phẩm")
    private String color;
    
    @NotBlank(message = "Vui lòng nhập kích thước sản phẩm")
    private String dimensions;
    
    @NotBlank(message = "Vui lòng nhập trọng lượng sản phẩm")
    private String weight;
}