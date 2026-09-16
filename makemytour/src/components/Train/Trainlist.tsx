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
import { gettrain, deletetrain } from "@/api";
import Loader from "../Loader";
import { Trash2, Edit, Loader2 } from "lucide-react";

const TrainList = ({ onSelect, refreshKey, onDeleted }: any) => {
  const [train, settrain] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchtrain = async () => {
      try {
        const data = await gettrain();
        settrain(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };
    fetchtrain();
  }, [refreshKey]);

  const handleDelete = async (t: any) => {
    const id = t.id || t._id;
    if (!id) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete train "${t.trainName}" (${t.from} -> ${t.to})? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      setErrorMsg(null);
      await deletetrain(id);
      settrain((prev) => prev.filter((item) => (item.id || item._id) !== id));
      if (onDeleted) {
        onDeleted(id);
      }
    } catch (err: any) {
      console.error("Failed to delete train:", err);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      if (status === 405 || status === 404) {
        setErrorMsg(`Delete endpoint returned HTTP ${status}. Please restart your Spring Boot backend in IntelliJ so the newly added delete route is loaded.`);
      } else if (err?.code === "ERR_NETWORK") {
        setErrorMsg("Network Error: Could not reach the Spring Boot backend on http://localhost:8080. Please ensure the backend is running.");
      } else {
        setErrorMsg(`Failed to delete train: ${serverMsg || 'Unknown error'}. Please ensure Spring Boot is restarted.`);
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
        <h3 className="text-lg font-semibold">Train List</h3>
        <span className="text-xs text-gray-500 font-medium">{train.length} {train.length === 1 ? 'train' : 'trains'}</span>
      </div>

      {errorMsg && (
        <div className="mb-3 p-2.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md">
          {errorMsg}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Train Name</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {train.length > 0 ? (
            train.map((t: any) => {
              const tId = t.id || t._id;
              const isDeleting = deletingId === tId;

              return (
                <TableRow key={tId}>
                  <TableCell className="font-medium">{t.trainName}</TableCell>
                  <TableCell>{t.from}</TableCell>
                  <TableCell>{t.to}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelect(t)}
                        disabled={isDeleting}
                        className="h-8 px-2.5 text-xs"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(t)}
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
                No trains found. Add a new train using the form.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
export default TrainList;