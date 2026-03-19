"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const rawCart = localStorage.getItem("krootal_cart");
      const rawOrder = localStorage.getItem("krootal_current_order");
      const rawUser = localStorage.getItem("krootal_user");
      if (rawCart) setItems(JSON.parse(rawCart));
      if (rawOrder) setCurrentOrder(JSON.parse(rawOrder));
      if (rawUser) setUser(JSON.parse(rawUser));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("krootal_cart", JSON.stringify(items));
    } catch {}
  }, [items]);

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

  const addItem = (item) => {
    const normalized = {
      id: item?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      quantity: Number(item?.quantity) || 1,
      ...item,
    };
    setItems((prev) => [...prev, normalized]);
  };

  const clearCart = () => setItems([]);

  const removeItem = (idOrIndex) => {
    setItems((prev) =>
      prev.filter((item, i) => (typeof idOrIndex === "number" ? i !== idOrIndex : item.id !== idOrIndex))
    );
  };

  const updateQuantity = (idOrIndex, nextQuantity) => {
    const quantity = Number(nextQuantity) || 0;
    if (quantity <= 0) {
      removeItem(idOrIndex);
      return;
    }

    setItems((prev) =>
      prev.map((item, i) =>
        (typeof idOrIndex === "number" ? i === idOrIndex : item.id === idOrIndex)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateDesign = (idOrIndex, design) => {
    setItems((prev) =>
      prev.map((item, i) =>
        (typeof idOrIndex === "number" ? i === idOrIndex : item.id === idOrIndex)
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
    () => items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item?.unitPrice) || 0) * (Number(item?.quantity) || 1), 0),
    [items]
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
      itemCount,
      subtotal,
    }),
    [items, currentOrder, user, itemCount, subtotal]
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
