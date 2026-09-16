import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { gethomestay, deletehomestay } from "@/api";
import Loader from "../Loader";
import { Trash2, Edit, Loader2 } from "lucide-react";

const HomestayList = ({ onSelect, refreshKey, onDeleted }: any) => {
  const [homestay, sethomestay] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchhomestay = async () => {
      try {
        const data = await gethomestay();
        sethomestay(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };
    fetchhomestay();
  }, [refreshKey]);

  const handleDelete = async (h: any) => {
    const id = h.id || h._id;
    if (!id) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete homestay "${h.homestayName}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      setErrorMsg(null);
      await deletehomestay(id);
      sethomestay((prev) => prev.filter((item) => (item.id || item._id) !== id));
      if (onDeleted) {
        onDeleted(id);
      }
    } catch (err: any) {
      console.error("Failed to delete homestay:", err);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      if (status === 405 || status === 404) {
        setErrorMsg(`Delete endpoint returned HTTP ${status}. Please restart your Spring Boot backend in IntelliJ so the newly added delete route is loaded.`);
      } else if (err?.code === "ERR_NETWORK") {
        setErrorMsg("Network Error: Could not reach the Spring Boot backend on http://localhost:8080. Please ensure the backend is running.");
      } else {
        setErrorMsg(`Failed to delete homestay: ${serverMsg || 'Unknown error'}. Please ensure Spring Boot is restarted.`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Homestay List</h3>
        <span className="text-xs text-gray-500 font-medium">{homestay.length} {homestay.length === 1 ? 'homestay' : 'homestays'}</span>
      </div>

      {errorMsg && (
        <div className="mb-3 p-2.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md">
          {errorMsg}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Homestay Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price/Night</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {homestay.length > 0 ? (
            homestay.map((h: any) => {
              const hId = h.id || h._id;
              const isDeleting = deletingId === hId;

              return (
                <TableRow key={hId}>
                  <TableCell className="font-medium">{h.homestayName}</TableCell>
                  <TableCell>{h.location}</TableCell>
                  <TableCell>₹{h.pricePerNight?.toLocaleString?.("en-IN") ?? h.pricePerNight}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelect(h)}
                        disabled={isDeleting}
                        className="h-8 px-2.5 text-xs"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(h)}
                        disabled={isDeleting}
                        className="h-8 px-2.5 text-xs bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                No homestays found. Add a new homestay using the form.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
export default HomestayList;