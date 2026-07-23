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
import { getcab } from "@/api";
import Loader from "../Loader";
const CabList = ({ onSelect, refreshKey }: any) => {
  const [cab, setcab] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const fetchcab = async () => {
      try {
        const data = await getcab();
        setcab(data);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };
    fetchcab();
  }, [refreshKey]);

  if (loading) {
    return <Loader />;
  }
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Cab List</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cab Type</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cab.length > 0 ? (
            cab?.map((cab: any) => (
              <TableRow key={cab.id}>
                <TableCell>{cab.cabType}</TableCell>
                <TableCell>{cab.from}</TableCell>
                <TableCell>{cab.to}</TableCell>
                <TableCell>
                  <Button onClick={() => onSelect(cab)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell>No data</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CabList;
