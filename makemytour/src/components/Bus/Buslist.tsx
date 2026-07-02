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
import { getbus } from "@/api";
import Loader from "../Loader";
const BusList = ({ onSelect }: any) => {
  const [bus, setbus] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const fetchbus = async () => {
      try {
        const data = await getbus();
        setbus(data);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };
    fetchbus();
  }, []);

  if (loading) {
    return <Loader />;
  }
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Bus List</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bus Name</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bus.length > 0 ? (
            bus?.map((bus: any) => (
              <TableRow key={bus._id}>
                <TableCell>{bus.busName}</TableCell>
                <TableCell>{bus.from}</TableCell>
                <TableCell>{bus.to}</TableCell>
                <TableCell>
                  <Button onClick={() => onSelect(bus)}>Edit</Button>
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
export default BusList;
