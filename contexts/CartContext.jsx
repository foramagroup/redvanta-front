"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const getCartSummaryFromItems = (cartItems) => ({
  itemCount: cartItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
  subtotal: cartItems.reduce((sum, item) => sum + (Number(item?.lineTotal) || ((Number(item?.unitPrice) || 0) * (Number(item?.quantity) || 1))), 0),
  totalCards: cartItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
});

const mapRemoteCartItem = (item) => ({
  id: item.id,
  productId: item.productId,
  packageTierId: item.packageTier?.id || null,
  productName: item.productName,
  quantity: Number(item.totalCards) || 1,
  totalCards: Number(item.totalCards) || 1,
  unitPrice: Number(item.unitPrice) || 0,
  lineTotal: Number(item.lineTotal) || 0,
  model: item.design?.cardModel || "classic",
  design: item.design || null,
  cardType: item.cardType || null,
  packageTier: item.packageTier || null,
  availableTiers: Array.isArray(item.availableTiers) ? item.availableTiers : [],
});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ itemCount: 0, subtotal: 0, totalCards: 0 });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isCartReady, setIsCartReady] = useState(false);

  const isAuthenticated = !!authUser;

  const handleClientLogout = () => {
    setAuthUser(null);
    setItems([]);
    setCartSummary({ itemCount: 0, subtotal: 0, totalCards: 0 });
    setCurrentOrder(null);
    setUser(null);
    setIsCartReady(true);

    try {
      localStorage.removeItem("krootal_cart");
      localStorage.removeItem("krootal_current_order");
      localStorage.removeItem("krootal_user");
    } catch {}
  };

  const resolveAuthUser = async () => {
    const response = await fetch(`${apiBase}/api/client/auth/me`, {
      credentials: "include",
    });
    const payload = await response.json().catch(() => ({}));

    if (response.ok && payload?.success && payload?.user) {
      setAuthUser(payload.user);
      return payload.user;
    }

    setAuthUser(null);
    return null;
  };

  const getStoredLocalCart = () => {
    try {
      const rawCart = localStorage.getItem("krootal_cart");
      return rawCart ? JSON.parse(rawCart) : [];
    } catch {
      return [];
    }
  };

  const loadLocalCart = () => {
    try {
      const rawCart = localStorage.getItem("krootal_cart");
      const rawOrder = localStorage.getItem("krootal_current_order");
      const rawUser = localStorage.getItem("krootal_user");
      if (rawCart) {
        const parsedItems = JSON.parse(rawCart);
        setItems(parsedItems);
        setCartSummary(getCartSummaryFromItems(parsedItems));
      } else {
        setItems([]);
        setCartSummary({ itemCount: 0, subtotal: 0, totalCards: 0 });
      }
      if (rawOrder) setCurrentOrder(JSON.parse(rawOrder));
      if (rawUser) setUser(JSON.parse(rawUser));
    } catch {}
  };

  const loadRemoteCart = async () => {
    const response = await fetch(`${apiBase}/api/client/shop/cart`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load remote cart");
    }

    const payload = await response.json().catch(() => ({}));
    const remoteItems = Array.isArray(payload?.data?.items) ? payload.data.items.map(mapRemoteCartItem) : [];
    setItems(remoteItems);
    setCartSummary({
      itemCount: Number(payload?.data?.itemCount) || remoteItems.length,
      subtotal: Number(payload?.data?.subtotal) || 0,
      totalCards: Number(payload?.data?.totalCards) || remoteItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
    });
  };

  const syncLocalCartToRemote = async (localItems) => {
    const syncableItems = Array.isArray(localItems)
      ? localItems
          .filter((item) => item?.productId && item?.packageTierId)
          .map((item) => ({
            productId: item.productId,
            packageTierId: item.packageTierId,
            cardTypeId: item.cardType?.id || null,
          }))
      : [];

    if (!syncableItems.length) return;

    const response = await fetch(`${apiBase}/api/client/shop/sync`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: syncableItems }),
    });

    if (!response.ok) {
      throw new Error("Failed to sync local cart");
    }

    localStorage.removeItem("krootal_cart");
  };

  useEffect(() => {
    let active = true;

    const bootstrapCart = async () => {
      try {
        const resolvedUser = await resolveAuthUser();

        if (!active) return;

        if (resolvedUser) {
          const localItems = getStoredLocalCart();
          if (localItems.length) {
            await syncLocalCartToRemote(localItems);
          }
          await loadRemoteCart();
        } else {
          setAuthUser(null);
          loadLocalCart();
        }
      } catch {
        if (active) {
          setAuthUser(null);
          loadLocalCart();
        }
      } finally {
        if (active) {
          setIsCartReady(true);
        }
      }
    };

    bootstrapCart();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onLogout = () => {
      handleClientLogout();
    };

    window.addEventListener("app:logout", onLogout);
    return () => window.removeEventListener("app:logout", onLogout);
  }, []);

  useEffect(() => {
    if (isAuthenticated) return;
    try {
      localStorage.setItem("krootal_cart", JSON.stringify(items));
    } catch {}
  }, [items, isAuthenticated]);

  useEffect(() => {
    try {
      if (currentOrder) {
        localStorage.setItem("krootal_current_order", JSON.stringify(currentOrder));
      } else {
        localStorage.removeItem("krootal_current_order");
      }
    } catch {}
  }, [currentOrder]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("krootal_user", JSON.stringify(user));
      }
    } catch {}
  }, [user]);

  const addItem = async (item) => {
    const normalized = {
      id: item?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      quantity: Number(item?.quantity) || 1,
      lineTotal: Number(item?.lineTotal) || ((Number(item?.unitPrice) || 0) * (Number(item?.quantity) || 1)),
      ...item,
    };

    if (normalized.productId && !normalized.packageTierId) {
      throw new Error("Product package is not ready yet");
    }

    let sessionUser = authUser;
    if (!sessionUser && normalized.productId && normalized.packageTierId) {
      try {
        sessionUser = await resolveAuthUser();
      } catch {
        sessionUser = null;
      }
    }

    if (sessionUser && normalized.productId && normalized.packageTierId) {
      const response = await fetch(`${apiBase}/api/client/shop/cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: normalized.productId,
          packageTierId: normalized.packageTierId,
          cardTypeId: normalized.cardType?.id || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to add item to cart");
      }

      await loadRemoteCart();
      localStorage.removeItem("krootal_cart");
      return;
    }

    setItems((prev) => [...prev, normalized]);
    setCartSummary((prev) => ({
      itemCount: prev.itemCount + normalized.quantity,
      subtotal: prev.subtotal + (Number(normalized.lineTotal) || 0),
      totalCards: prev.totalCards + normalized.quantity,
    }));
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      const response = await fetch(`${apiBase}/api/client/shop/cart`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to clear cart");
      }

      setItems([]);
      setCartSummary({ itemCount: 0, subtotal: 0, totalCards: 0 });
      return;
    }

    setItems([]);
    setCartSummary({ itemCount: 0, subtotal: 0, totalCards: 0 });
  };

  const removeItem = async (idOrIndex) => {
    if (isAuthenticated && typeof idOrIndex === "number") {
      await fetch(`${apiBase}/api/client/shop/cart/${idOrIndex}`, {
        method: "DELETE",
        credentials: "include",
      });
      await loadRemoteCart();
      return;
    }

    setItems((prev) => {
      const nextItems = prev.filter((item, i) => (typeof idOrIndex === "number" ? i !== idOrIndex : item.id !== idOrIndex));
      setCartSummary(getCartSummaryFromItems(nextItems));
      return nextItems;
    });
  };

  const updateQuantity = async (idOrIndex, nextQuantity) => {
    const quantity = Number(nextQuantity) || 0;
    if (quantity <= 0) {
      await removeItem(idOrIndex);
      return;
    }

    if (isAuthenticated && typeof idOrIndex === "number") {
      const item = items.find((entry) => entry.id === idOrIndex);

      if (!item || quantity === item.quantity) {
        return;
      }

      const response = await fetch(`${apiBase}/api/client/shop/cart/${idOrIndex}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalCards: quantity }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (payload?.error === "Aucun champ à modifier") {
          await loadRemoteCart();
          return;
        }
        throw new Error(payload?.error || "Failed to update cart item");
      }

      await loadRemoteCart();
      return;
    }

    setItems((prev) => {
      const nextItems = prev.map((item, i) =>
        (typeof idOrIndex === "number" ? i === idOrIndex : item.id === idOrIndex)
          ? { ...item, quantity, lineTotal: (Number(item?.unitPrice) || 0) * quantity }
          : item
      );
      setCartSummary(getCartSummaryFromItems(nextItems));
      return nextItems;
    });
  };

  const updateDesign = (idOrIndex, design) => {
    setItems((prev) =>
      prev.map((item, i) =>
        (
          item.id === idOrIndex ||
          String(item.id) === String(idOrIndex) ||
          (!isAuthenticated && typeof idOrIndex === "number" && i === idOrIndex)
        )
          ? { ...item, design }
          : item
      )
    );
  };

  const placeOrder = (shippingMethod, address) => {
    const shippingPrices = {
      standard: 9.99,
      express: 19.99,
      international: 34.99,
    };
    const shippingCost = shippingPrices[shippingMethod] || shippingPrices.standard;
    const total = items.reduce(
      (sum, item) => sum + (Number(item?.unitPrice) || 0) * (Number(item?.quantity) || 1),
      0
    ) + shippingCost;

    const normalizedUser = {
      email: user?.email || "customer@example.com",
      companyName: user?.companyName || address?.fullName || "",
      address: address?.address || "",
    };

    const order = {
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: items.map((item) => ({
        ...item,
        design: item?.design ? { ...item.design, status: "locked" } : item?.design,
      })),
      subtotal: total - shippingCost,
      total,
      shippingMethod,
      shippingAddress: address,
      shippingCost,
      status: "processing",
      trackingNumber: `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    };

    setCurrentOrder(order);
    setUser(normalizedUser);
    setItems([]);

    return order;
  };

  const itemCount = useMemo(
    () => (
      isAuthenticated
        ? (Number(cartSummary.totalCards) || 0)
        : items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0)
    ),
    [cartSummary.totalCards, isAuthenticated, items]
  );

  const subtotal = useMemo(
    () => (
      isAuthenticated
        ? (Number(cartSummary.subtotal) || 0)
        : items.reduce((sum, item) => sum + (Number(item?.lineTotal) || ((Number(item?.unitPrice) || 0) * (Number(item?.quantity) || 1))), 0)
    ),
    [cartSummary.subtotal, isAuthenticated, items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      clearCart,
      removeItem,
      updateQuantity,
      updateDesign,
      placeOrder,
      currentOrder,
      user,
      authUser,
      isAuthenticated,
      isCartReady,
      cartSummary,
      itemCount,
      subtotal,
    }),
    [items, currentOrder, user, authUser, isAuthenticated, isCartReady, cartSummary, itemCount, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
