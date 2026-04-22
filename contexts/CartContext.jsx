"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const isSyncableCartItem = (item) => !!item?.productId;
const CART_SCOPE_KEY = "krootal_cart_scope";
const GUEST_SCOPE = "guest";

const getCartSummaryFromItems = (cartItems) => ({
  itemCount: cartItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
  subtotal: cartItems.reduce((sum, item) => sum + (Number(item?.lineTotal) || ((Number(item?.unitPrice) || 0) * (Number(item?.quantity) || 1))), 0),
  totalCards: cartItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
});

const mapRemoteCartItem = (item) => {
  const quantity = Number(item.quantity ?? item.totalCards) || 1;

  return {
    id: item.id,
    productId: item.productId,
    packageTierId: item.packageTier?.id || null,
    productName: item.productName,
    quantity,
    totalCards: Number(item.totalCards) || quantity,
    unitPrice: Number(item.unitPrice) || 0,
    lineTotal: Number(item.lineTotal) || 0,
    model: item.design?.cardModel || "classic",
    design: item.design || null,
    cardType: item.cardType || null,
    packageTier: item.packageTier || null,
    availableTiers: Array.isArray(item.availableTiers) ? item.availableTiers : [],
  };
};

const getSessionScope = (sessionUser) => {
  if (!sessionUser) return GUEST_SCOPE;
  const userId = sessionUser?.id ?? sessionUser?.userId ?? "unknown";
  const companyId =
    sessionUser?.activeCompany?.id ??
    sessionUser?.companyId ??
    sessionUser?.user?.activeCompany?.id ??
    "unknown";
  return `user:${userId}:company:${companyId}`;
};

const LOCAL_CONFIG_KEY = "krootal_local_config_cart";

const readLocalConfigItems = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_CONFIG_KEY) || "[]"); } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [localConfigItems, setLocalConfigItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ itemCount: 0, subtotal: 0, totalCards: 0 });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isCartReady, setIsCartReady] = useState(false);

  const isAuthenticated = !!authUser;

  const clearStoredCartState = () => {
    try {
      localStorage.removeItem("krootal_cart");
      localStorage.removeItem("krootal_current_order");
      localStorage.removeItem("krootal_user");
      localStorage.removeItem(CART_SCOPE_KEY);
    } catch {}
  };

  const getStoredCartScope = () => {
    try {
      return localStorage.getItem(CART_SCOPE_KEY) || GUEST_SCOPE;
    } catch {
      return GUEST_SCOPE;
    }
  };

  const setStoredCartScope = (scope) => {
    try {
      localStorage.setItem(CART_SCOPE_KEY, scope);
    } catch {}
  };

  const handleClientLogout = () => {
    setAuthUser(null);
    setItems([]);
    setCartSummary({ itemCount: 0, subtotal: 0, totalCards: 0 });
    setCurrentOrder(null);
    setUser(null);
    setIsCartReady(true);

    try {
      clearStoredCartState();
    } catch {}
  };

  const resolveAuthUser = async () => {
    const response = await fetch(`${apiBase}/client/auth/me`, {
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

  const getPersistableCartItems = (cartItems) =>
    Array.isArray(cartItems)
      ? cartItems.filter((item) => !isAuthenticated || !isSyncableCartItem(item))
      : [];

  const loadLocalCart = () => {
    try {
      if (getStoredCartScope() !== GUEST_SCOPE) {
        clearStoredCartState();
        setItems([]);
        setCartSummary({ itemCount: 0, subtotal: 0, totalCards: 0 });
        return;
      }
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
    const response = await fetch(`${apiBase}/client/shop/cart`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load remote cart");
    }

    const payload = await response.json().catch(() => ({}));
    const remoteItems = Array.isArray(payload?.data?.items) ? payload.data.items.map(mapRemoteCartItem) : [];
    const nextSummary = {
      itemCount: remoteItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
      subtotal: Number(payload?.data?.subtotal) || 0,
      totalCards: remoteItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
    };
    setItems(remoteItems);
    setCartSummary(nextSummary);
    return { remoteItems, nextSummary };
  };

  const syncLocalCartToRemote = async (localItems) => {
    const syncableItems = Array.isArray(localItems)
      ? localItems
          .filter((item) => item?.productId)
          .map((item) => ({
            productId: item.productId,
            packageTierId: item.packageTierId || null,
            quantity: Number(item.quantity) || 1,
            cardTypeId: item.cardType?.id || null,
          }))
      : [];

    if (!syncableItems.length) return;

    const response = await fetch(`${apiBase}/client/shop/sync`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: syncableItems }),
    });

    if (!response.ok) {
      throw new Error("Failed to sync local cart");
    }

    clearStoredCartState();
  };

 

    const bootstrapCart = async () => {
      setIsCartReady(false);
      try {
        const resolvedUser = await resolveAuthUser();
        const currentScope = getSessionScope(resolvedUser);
        const storedScope = getStoredCartScope();

        if (resolvedUser) {
          if (storedScope !== GUEST_SCOPE && storedScope !== currentScope) {
            clearStoredCartState();
          }
          const localItems = getStoredLocalCart();
          if (localItems.length) {
            await syncLocalCartToRemote(localItems);
          }
          const { remoteItems } = await loadRemoteCart();
          const localOnlyItems = localItems.filter((item) => !isSyncableCartItem(item));

          if (localOnlyItems.length) {
            const mergedItems = [...remoteItems, ...localOnlyItems];
            setItems(mergedItems);
            setCartSummary(getCartSummaryFromItems(mergedItems));
          }
          setStoredCartScope(currentScope);
        } else {
          setAuthUser(null);
          if (storedScope !== GUEST_SCOPE) {
            clearStoredCartState();
          }
          setStoredCartScope(GUEST_SCOPE);
          loadLocalCart();
        }
      } catch {
      
          setAuthUser(null);
          setStoredCartScope(GUEST_SCOPE);
          loadLocalCart();
  
      } finally {
          setIsCartReady(true);
      }
    };

     useEffect(() => {
   

    bootstrapCart();

  
  }, []);

  useEffect(() => {
    const onLogin  = () => bootstrapCart();
    const onLogout = () => handleClientLogout();

    window.addEventListener("app:login", onLogin);
    window.addEventListener("app:logout", onLogout);
    return () => {
      window.removeEventListener("app:login", onLogin);
      window.removeEventListener("app:logout", onLogout);
    };
  }, []);

  useEffect(() => {
    if (!isCartReady) return;

    try {
      const persistableItems = getPersistableCartItems(items);
      const scope = isAuthenticated ? getSessionScope(authUser) : GUEST_SCOPE;

      if (persistableItems.length) {
        localStorage.setItem("krootal_cart", JSON.stringify(persistableItems));
        setStoredCartScope(scope);
      } else {
        localStorage.removeItem("krootal_cart");
        setStoredCartScope(scope);
      }
    } catch {}
  }, [isCartReady, items, isAuthenticated, authUser]);

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

  // ── Local configurator items (multi-location, no API) ────────
  useEffect(() => {
    setLocalConfigItems(readLocalConfigItems());
  }, []);

  const addLocalItem = (item) => {
    const entry = { ...item, id: `local-${Date.now()}`, createdAt: Date.now() };
    const next = [...readLocalConfigItems(), entry];
    try { localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(next)); } catch {}
    setLocalConfigItems(next);
  };

  const removeLocalItem = (id) => {
    const next = readLocalConfigItems().filter((i) => i.id !== id);
    try { localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(next)); } catch {}
    setLocalConfigItems(next);
  };

  const replaceLocalItem = (id, item) => {
    const next = readLocalConfigItems().map((i) => i.id === id ? { ...item, id, createdAt: i.createdAt } : i);
    try { localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(next)); } catch {}
    setLocalConfigItems(next);
  };

  const addItem = async (item) => {
    const normalized = {
      id: item?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      quantity: Number(item?.quantity) || 1,
      lineTotal: Number(item?.lineTotal) || ((Number(item?.unitPrice) || 0) * (Number(item?.quantity) || 1)),
      ...item,
    };

    let sessionUser = authUser;
    if (!sessionUser && isSyncableCartItem(normalized)) {
      try {
        sessionUser = await resolveAuthUser();
      } catch {
        sessionUser = null;
      }
    }

    if (sessionUser && isSyncableCartItem(normalized)) {
      const response = await fetch(`${apiBase}/client/shop/cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: normalized.productId,
          packageTierId: normalized.packageTierId || null,
          quantity: Number(normalized.quantity) || 1,
          cardTypeId: normalized.cardType?.id || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to add item to cart");
      }

      const { remoteItems } = await loadRemoteCart();
      const localOnlyItems = getStoredLocalCart().filter((entry) => !isSyncableCartItem(entry));

      if (localOnlyItems.length) {
        const mergedItems = [...remoteItems, ...localOnlyItems];
        setItems(mergedItems);
        setCartSummary(getCartSummaryFromItems(mergedItems));
      } else {
        localStorage.removeItem("krootal_cart");
      }
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
      const response = await fetch(`${apiBase}/client/shop/cart`, {
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
      await fetch(`${apiBase}/client/shop/cart/${idOrIndex}`, {
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

      const response = await fetch(`${apiBase}/client/shop/cart/${idOrIndex}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item?.packageTierId ? { totalCards: quantity } : { quantity }),
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
      localConfigItems,
      addLocalItem,
      removeLocalItem,
      replaceLocalItem,
    }),
    [items, localConfigItems, currentOrder, user, authUser, isAuthenticated, isCartReady, cartSummary, itemCount, subtotal, replaceLocalItem]
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
