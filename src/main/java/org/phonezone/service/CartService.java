package org.phonezone.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.phonezone.dto.CartItemRequest;
import org.phonezone.entity.CartItem;
import org.phonezone.entity.Product;
import org.phonezone.entity.User;

import java.util.List;

@ApplicationScoped
public class CartService {

    public List<CartItem> getCartItems(String username) {
        User user = User.find("username", username).firstResult();
        if (user == null) return List.of();
        return CartItem.find("user = ?1 order by createdAt desc", user).list();
    }

    @Transactional
    public CartItem addToCart(String username, CartItemRequest request) {
        User user = User.find("username", username).withLock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE).firstResult();
        Product product = Product.findById(request.productId);

        if (user == null || product == null) {
            return null;
        }

        // Check if item already in cart
        CartItem existingItem = CartItem.find("user = ?1 and product = ?2", user, product).firstResult();
        
        if (existingItem != null) {
            validateQuantity(product, (long) existingItem.quantity + request.quantity);
            existingItem.quantity += request.quantity;
            existingItem.persist();
            return existingItem;
        }

        CartItem newItem = new CartItem();
        validateQuantity(product, request.quantity);
        newItem.user = user;
        newItem.product = product;
        newItem.quantity = request.quantity;
        newItem.persist();

        return newItem;
    }

    @Transactional
    public CartItem updateCartItemQuantity(String username, Long cartItemId, int newQuantity) {
        User user = User.find("username", username).withLock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE).firstResult();
        CartItem item = CartItem.findById(cartItemId);

        if (user == null || item == null || !item.user.id.equals(user.id)) {
            return null;
        }

        if (newQuantity <= 0) {
            item.delete();
            return null;
        }

        validateQuantity(item.product, newQuantity);
        item.quantity = newQuantity;
        item.persist();
        return item;
    }

    @Transactional
    public boolean removeCartItem(String username, Long cartItemId) {
        User user = User.find("username", username).withLock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE).firstResult();
        CartItem item = CartItem.findById(cartItemId);

        if (user == null || item == null || !item.user.id.equals(user.id)) {
            return false;
        }

        item.delete();
        return true;
    }

    @Transactional
    public void clearCart(String username) {
        User user = User.find("username", username).withLock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE).firstResult();
        if (user != null) {
            CartItem.delete("user", user);
        }
    }

    private void validateQuantity(Product product, long quantity) {
        if (!Boolean.TRUE.equals(product.isActive) || quantity < 1 || product.stockQuantity == null || quantity > product.stockQuantity) {
            throw new IllegalArgumentException("Sản phẩm không còn bán hoặc số lượng vượt tồn kho");
        }
    }
}
