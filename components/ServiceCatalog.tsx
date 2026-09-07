"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { SERVICE_GROUPS } from "@/lib/services";
import type { ServiceRecord } from "@/lib/backend/types";
const CatalogContext = createContext<{
  services: ServiceRecord[];
  loading: boolean;
  error: string;
  reload: () => void;
}>({ services: [], loading: true, error: "", reload: () => {} });
export function ServiceCatalog({ children, initialServices = [], initialError = "" }: { children: React.ReactNode; initialServices?: ServiceRecord[]; initialError?: string }) {
  const [services, setServices] = useState<ServiceRecord[]>(initialServices),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(initialError);
  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/services", { cache: "no-store", signal: AbortSignal.timeout(10000) });
      const data = await res.json();
      if (!res.ok) throw Error(data.message);
      setServices(data.services);
      setError("");
    } catch {
      setError("โหลดบริการไม่สำเร็จ กรุณาลองใหม่หรือติดต่อ LINE OA");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Synchronize with the remote catalog; state is set when the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
    const refresh = () => {
      if (document.visibilityState === "visible") void reload();
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [reload]);
  return (
    <CatalogContext.Provider value={{ services, loading, error, reload }}>
      {children}
    </CatalogContext.Provider>
  );
}
export function useCatalog() {
  const value = useContext(CatalogContext);
  const groups = SERVICE_GROUPS.map((group) => ({
    ...group,
    services: value.services
      .filter((s) => s.group_id === group.id)
      .map((s) => s.name),
  })).filter((g) => g.services.length > 0);
  return { ...value, groups };
}
export function CatalogStatus() {
  const { loading, error, reload, services } = useCatalog();
  if (loading)
    return (
      <p className="text-center font-thai p-4" role="status">
        กำลังโหลดรายการบริการ…
      </p>
    );
  if (error)
    return (
      <p className="text-center font-thai text-amber-300 p-4" role="alert">
        {error}{" "}
        <button type="button" className="underline" onClick={reload}>
          ลองใหม่
        </button>
      </p>
    );
  if (!services.length)
    return (
      <p className="text-center font-thai p-4">
        ขณะนี้ยังไม่มีรายการเปิดรับ กรุณาสอบถามผ่าน LINE OA
      </p>
    );
  return null;
}
