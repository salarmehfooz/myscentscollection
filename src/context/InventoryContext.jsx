import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  limit,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { INITIAL_PRODUCTS } from "../data/initialProducts";

const OperationType = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LIST: "list",
  GET: "get",
  WRITE: "write",
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path,
  };
  console.warn("Firestore Warning/Error:", JSON.stringify(errInfo));
}

// Timeout wrapper so async operations never hang indefinitely on localhost or offline
const withTimeout = (promise, timeoutMs = 3500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Operation timed out. Using local storage.")),
        timeoutMs,
      ),
    ),
  ]);
};

// Clean undefined fields that cause Firestore errors
function cleanObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const cleaned = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      cleaned[key] = null;
    } else if (Array.isArray(val)) {
      cleaned[key] = val.map((item) =>
        typeof item === "object" && item !== null ? cleanObject(item) : item,
      );
    } else if (typeof val === "object" && val !== null) {
      cleaned[key] = cleanObject(val);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

const getStoredData = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`LocalStorage save error for ${key}:`, e);
  }
};

const InventoryContext = createContext(undefined);

export const InventoryProvider = ({ children }) => {
  const initialProducts = getStoredData("myscents_products", INITIAL_PRODUCTS);
  const [products, setProducts] = useState(initialProducts);
  const [sales, setSales] = useState(() => getStoredData("myscents_sales", []));
  const [inquiries, setInquiries] = useState(() =>
    getStoredData("myscents_inquiries", []),
  );
  // Fast hydration: only show full blocking loading state if no cached or bundled products exist
  const [loading, setLoading] = useState(
    () => !initialProducts || initialProducts.length === 0,
  );
  const [error, setError] = useState(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Sync state changes to localStorage as a reliable fallback
  useEffect(() => {
    if (products && products.length > 0) {
      setStoredData("myscents_products", products);
    }
  }, [products]);

  useEffect(() => {
    setStoredData("myscents_sales", sales);
  }, [sales]);

  useEffect(() => {
    setStoredData("myscents_inquiries", inquiries);
  }, [inquiries]);

  // Subscribe to Products with highest priority; defer administrative collections (sales/inquiries)
  useEffect(() => {
    let unsubscribeProducts = () => {};
    let unsubscribeSales = () => {};
    let unsubscribeInquiries = () => {};
    let adminTimeoutId;

    if (!isFirebaseConfigured) {
      setLoading(false);
      setIsFirebaseConnected(false);
      return;
    }

    // Safety timeout: ensure loading state never hangs on localhost cold starts
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    try {
      // 1. High-Priority Products Listener: Dedicates 100% bandwidth to product catalogue
      const productsRef = collection(db, "products");
      unsubscribeProducts = onSnapshot(
        productsRef,
        { includeMetadataChanges: false },
        (snapshot) => {
          clearTimeout(safetyTimer);
          const list = [];
          snapshot.forEach((docSnap) => {
            list.push({
              id: docSnap.id,
              ...docSnap.data(),
            });
          });

          list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          if (list.length > 0) {
            setProducts(list);
          }
          setLoading(false);
          setIsFirebaseConnected(true);
        },
        (err) => {
          clearTimeout(safetyTimer);
          handleFirestoreError(err, OperationType.GET, "products");
          setError("Firestore connection error. Operating in offline mode.");
          setIsFirebaseConnected(false);
          setLoading(false);
        },
      );

      // 2. Defer heavy administrative collections (orders with payment screenshot base64 strings)
      // so they do not block product loading
      adminTimeoutId = setTimeout(() => {
        try {
          // Subscribe to Sales collection (limited to recent 100)
          const salesRef = collection(db, "sales");
          const salesQuery = query(salesRef, limit(100));
          unsubscribeSales = onSnapshot(
            salesQuery,
            { includeMetadataChanges: false },
            (snapshot) => {
              const salesList = [];
              snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                salesList.push({
                  id: docSnap.id,
                  ...data,
                  createdAt: data.createdAt?.toDate
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt || new Date().toISOString(),
                });
              });

              // Sort latest sales first
              salesList.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
              setSales((prev) => {
                // Keep any local pending orders that haven't synced to Firestore yet
                const localOnly = prev.filter(
                  (p) =>
                    p.id.startsWith("local-") &&
                    !salesList.some((s) => s.orderNumber === p.orderNumber),
                );
                return [...localOnly, ...salesList];
              });
            },
            (err) => {
              handleFirestoreError(err, OperationType.GET, "sales");
            },
          );

          // Subscribe to Inquiries collection
          const inquiriesRef = collection(db, "inquiries");
          const inquiriesQuery = query(inquiriesRef, limit(100));
          unsubscribeInquiries = onSnapshot(
            inquiriesQuery,
            { includeMetadataChanges: false },
            (snapshot) => {
              const inquiriesList = [];
              snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                inquiriesList.push({
                  id: docSnap.id,
                  ...data,
                  createdAt: data.createdAt?.toDate
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt || new Date().toISOString(),
                });
              });

              inquiriesList.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
              setInquiries((prev) => {
                const localOnly = prev.filter((p) => p.id.startsWith("local-"));
                return [...localOnly, ...inquiriesList];
              });
            },
            (err) => {
              handleFirestoreError(err, OperationType.GET, "inquiries");
            },
          );
        } catch (adminErr) {
          console.warn("Deferred admin listeners warning:", adminErr);
        }
      }, 500);
    } catch (e) {
      clearTimeout(safetyTimer);
      console.warn("Firebase listener catch:", e);
      setLoading(false);
      setIsFirebaseConnected(false);
    }

    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(adminTimeoutId);
      unsubscribeProducts();
      unsubscribeSales();
      unsubscribeInquiries();
    };
  }, []);

  // Seed initial products if DB is empty
  const seedInitialProducts = async () => {
    try {
      setLoading(true);
      setProducts(INITIAL_PRODUCTS);
      setStoredData("myscents_products", INITIAL_PRODUCTS);

      if (isFirebaseConfigured) {
        const batch = writeBatch(db);
        const productsRef = collection(db, "products");

        for (const prod of INITIAL_PRODUCTS) {
          const newDocRef = doc(productsRef);
          batch.set(newDocRef, {
            ...prod,
            updatedAt: new Date().toISOString(),
          });
        }
        await withTimeout(batch.commit(), 4000);
      }
      setLoading(false);
    } catch (err) {
      console.warn("Failed to seed to Firestore, seeded locally:", err);
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    const localId = "local-prod-" + Date.now();
    const newProduct = {
      id: localId,
      ...productData,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);

    if (!isFirebaseConfigured) {
      return localId;
    }

    try {
      const docRef = await withTimeout(
        addDoc(collection(db, "products"), {
          ...productData,
          updatedAt: new Date().toISOString(),
        }),
        3500,
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === localId ? { ...p, id: docRef.id } : p)),
      );
      return docRef.id;
    } catch (err) {
      console.warn("Error adding product to Firestore, saved locally:", err);
      return localId;
    }
  };

  const updateProduct = async (id, updates) => {
    const timestamp = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: timestamp } : p,
      ),
    );

    if (!isFirebaseConfigured) return;

    try {
      const productRef = doc(db, "products", id);
      if (!id.startsWith("p-") && !id.startsWith("local-")) {
        await withTimeout(
          updateDoc(productRef, {
            ...updates,
            updatedAt: timestamp,
          }),
          3500,
        );
      } else {
        const currentProd = products.find((p) => p.id === id);
        if (currentProd) {
          await withTimeout(
            setDoc(
              productRef,
              {
                ...currentProd,
                ...updates,
                updatedAt: timestamp,
              },
              { merge: true },
            ),
            3500,
          );
        }
      }
    } catch (err) {
      console.warn("Error updating product in Firestore, saved locally:", err);
    }
  };

  const deleteProduct = async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (!isFirebaseConfigured || id.startsWith("local-")) return;

    try {
      await withTimeout(deleteDoc(doc(db, "products", id)), 3500);
    } catch (err) {
      console.warn(
        "Error deleting product from Firestore, removed locally:",
        err,
      );
    }
  };

  const adjustStock = async (id, delta) => {
    const p = products.find((prod) => prod.id === id);
    if (!p) return;
    const newStock = Math.max(0, p.stock + delta);
    await updateProduct(id, { stock: newStock });
  };

  // Process a POS sale: logs sale record and updates stock levels
  const processSaleOrder = async (orderData) => {
    const timestamp = new Date().toISOString();
    const localSaleId = "sale-" + Date.now();
    const sanitized = cleanObject(orderData);

    const localSaleRecord = {
      id: localSaleId,
      ...sanitized,
      createdAt: timestamp,
    };

    // Update local products stock immediately
    setProducts((prev) =>
      prev.map((prod) => {
        const item = sanitized.items?.find((i) => i.productId === prod.id);
        if (item) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - item.quantity),
            updatedAt: timestamp,
          };
        }
        return prod;
      }),
    );

    // Update local sales list
    setSales((prev) => [localSaleRecord, ...prev]);

    if (!isFirebaseConfigured) {
      return localSaleId;
    }

    try {
      const batch = writeBatch(db);
      const salesRef = collection(db, "sales");
      const newSaleRef = doc(salesRef);

      batch.set(newSaleRef, {
        ...sanitized,
        createdAt: serverTimestamp(),
      });

      for (const item of sanitized.items || []) {
        if (item.productId && !item.productId.startsWith("local-")) {
          const prodRef = doc(db, "products", item.productId);
          const currentProd = products.find((p) => p.id === item.productId);
          if (currentProd) {
            batch.update(prodRef, {
              stock: Math.max(0, currentProd.stock - item.quantity),
              updatedAt: timestamp,
            });
          }
        }
      }

      await withTimeout(batch.commit(), 3500);
      return newSaleRef.id;
    } catch (err) {
      console.warn("Firestore POS sale write error, preserved locally:", err);
      return localSaleId;
    }
  };

  // Submit pending online order WITHOUT decrementing stock yet
  const submitPendingOrder = async (orderData) => {
    const timestamp = new Date().toISOString();
    const localId = "local-order-" + Date.now();
    const sanitized = cleanObject(orderData);

    const pendingRecord = {
      id: localId,
      ...sanitized,
      status: "Pending",
      createdAt: timestamp,
    };

    // Always record locally immediately so customer & admin see the order without delay
    setSales((prev) => [
      pendingRecord,
      ...prev.filter((s) => s.orderNumber !== orderData.orderNumber),
    ]);

    if (!isFirebaseConfigured) {
      return localId;
    }

    try {
      const docRef = await withTimeout(
        addDoc(collection(db, "sales"), {
          ...sanitized,
          status: "Pending",
          createdAt: serverTimestamp(),
        }),
        3500,
      );

      // Update record with real Firestore doc ID
      setSales((prev) =>
        prev.map((s) => (s.id === localId ? { ...s, id: docRef.id } : s)),
      );
      return docRef.id;
    } catch (err) {
      console.warn(
        "Firestore order submission timed out or failed; saved locally:",
        err,
      );
      return localId;
    }
  };

  // Confirm order by Admin: reduces product quantities and updates status to 'Completed'
  const confirmAndFulfillOrder = async (orderId) => {
    const targetOrder = sales.find((s) => s.id === orderId);
    if (!targetOrder) {
      throw new Error("Order not found");
    }

    const timestamp = new Date().toISOString();

    // 1. Optimistic update in local state
    setSales((prev) =>
      prev.map((s) =>
        s.id === orderId
          ? { ...s, status: "Completed", confirmedAt: timestamp }
          : s,
      ),
    );

    setProducts((prev) =>
      prev.map((prod) => {
        const item = targetOrder.items?.find((i) => i.productId === prod.id);
        if (item) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - item.quantity),
            updatedAt: timestamp,
          };
        }
        return prod;
      }),
    );

    if (!isFirebaseConfigured || orderId.startsWith("local-")) {
      return;
    }

    try {
      const batch = writeBatch(db);
      const orderRef = doc(db, "sales", orderId);
      batch.update(orderRef, {
        status: "Completed",
        confirmedAt: timestamp,
      });

      for (const item of targetOrder.items || []) {
        if (item.productId && !item.productId.startsWith("local-")) {
          const currentProd = products.find((p) => p.id === item.productId);
          if (currentProd) {
            const prodRef = doc(db, "products", item.productId);
            batch.update(prodRef, {
              stock: Math.max(0, currentProd.stock - item.quantity),
              updatedAt: timestamp,
            });
          }
        }
      }

      await withTimeout(batch.commit(), 3500);
    } catch (err) {
      console.warn("Firestore confirm order error, saved locally:", err);
    }
  };

  // Cancel Sale Order: sets status to 'Cancelled' and optionally restores inventory stock
  const cancelSaleOrder = async (orderId, restoreStock = true) => {
    const targetOrder = sales.find((s) => s.id === orderId);
    if (!targetOrder) {
      throw new Error("Order not found");
    }

    const timestamp = new Date().toISOString();
    const wasCompleted =
      targetOrder.status === "Completed" || !targetOrder.status;
    const shouldRestore = wasCompleted && restoreStock;

    setSales((prev) =>
      prev.map((s) =>
        s.id === orderId
          ? { ...s, status: "Cancelled", cancelledAt: timestamp }
          : s,
      ),
    );

    if (shouldRestore && targetOrder.items) {
      setProducts((prev) =>
        prev.map((p) => {
          const item = targetOrder.items.find((i) => i.productId === p.id);
          if (item) {
            return {
              ...p,
              stock: p.stock + item.quantity,
              updatedAt: timestamp,
            };
          }
          return p;
        }),
      );
    }

    if (!isFirebaseConfigured || orderId.startsWith("local-")) {
      return;
    }

    try {
      const batch = writeBatch(db);
      const orderRef = doc(db, "sales", orderId);
      batch.update(orderRef, {
        status: "Cancelled",
        cancelledAt: timestamp,
      });

      if (shouldRestore && targetOrder.items) {
        for (const item of targetOrder.items) {
          if (item.productId && !item.productId.startsWith("local-")) {
            const currentProd = products.find((p) => p.id === item.productId);
            if (currentProd) {
              const prodRef = doc(db, "products", item.productId);
              batch.update(prodRef, {
                stock: currentProd.stock + item.quantity,
                updatedAt: timestamp,
              });
            }
          }
        }
      }

      await withTimeout(batch.commit(), 3500);
    } catch (err) {
      console.warn("Firestore cancel order error, updated locally:", err);
    }
  };

  // Delete Sale Order from database
  const deleteSaleOrder = async (orderId) => {
    setSales((prev) => prev.filter((s) => s.id !== orderId));
    if (
      !isFirebaseConfigured ||
      orderId.startsWith("local-") ||
      orderId.startsWith("sale-")
    ) {
      return;
    }

    try {
      await withTimeout(deleteDoc(doc(db, "sales", orderId)), 3500);
    } catch (err) {
      console.warn("Firestore delete sale error:", err);
    }
  };

  // Submit Contact Form Inquiry
  const submitInquiry = async (inquiryData) => {
    const localInquiry = {
      id: "local-" + Date.now(),
      ...cleanObject(inquiryData),
      status: "New",
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => [localInquiry, ...prev]);

    if (!isFirebaseConfigured) {
      return localInquiry.id;
    }

    try {
      const docRef = await withTimeout(
        addDoc(collection(db, "inquiries"), {
          ...cleanObject(inquiryData),
          status: "New",
          createdAt: serverTimestamp(),
        }),
        3500,
      );
      return docRef.id;
    } catch (err) {
      console.warn(
        "Error submitting inquiry to Firestore, preserved locally:",
        err,
      );
      return localInquiry.id;
    }
  };

  const updateInquiryStatus = async (id, status) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)),
    );
    if (!isFirebaseConfigured || id.startsWith("local-")) {
      return;
    }

    try {
      const inqRef = doc(db, "inquiries", id);
      await withTimeout(updateDoc(inqRef, { status }), 3500);
    } catch (err) {
      console.warn("Error updating inquiry status in Firestore:", err);
    }
  };

  const deleteInquiry = async (id) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    if (!isFirebaseConfigured || id.startsWith("local-")) {
      return;
    }

    try {
      await withTimeout(deleteDoc(doc(db, "inquiries", id)), 3500);
    } catch (err) {
      console.warn("Error deleting inquiry from Firestore:", err);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        sales,
        inquiries,
        loading,
        error,
        seedInitialProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        processSaleOrder,
        submitPendingOrder,
        confirmAndFulfillOrder,
        cancelSaleOrder,
        deleteSaleOrder,
        submitInquiry,
        updateInquiryStatus,
        deleteInquiry,
        isFirebaseConnected,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
