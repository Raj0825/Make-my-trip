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
import { gethomestay } from "@/api";
import Loader from "../Loader";

const HomestayList = ({ onSelect, refreshKey }: any) => {
  const [homestay, sethomestay] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const fetchhomestay = async () => {
      try {
        const data = await gethomestay();
        sethomestay(data);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };
    fetchhomestay();
  }, [refreshKey]);

  if (loading) {
    return <Loader />;
  }
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Homestay List</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Homestay Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price/Night</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {homestay.length > 0 ? (
            homestay.map((homestay: any) => (
              <TableRow key={homestay.id}>
                <TableCell>{homestay.homestayName}</TableCell>
                <TableCell>{homestay.location}</TableCell>
                <TableCell>${homestay.pricePerNight}</TableCell>
                <TableCell>
                  <Button onClick={() => onSelect(homestay)}>Edit</Button>
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
export default HomestayList;