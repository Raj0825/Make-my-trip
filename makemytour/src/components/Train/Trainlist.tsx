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
import { gettrain } from "@/api";
import Loader from "../Loader";
const TrainList = ({ onSelect, refreshKey }: any) => {
  const [train, settrain] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const fetchtrain = async () => {
      try {
        const data = await gettrain();
        settrain(data);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };
    fetchtrain();
  }, [refreshKey]);

  if (loading) {
    return <Loader />;
  }
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Train List</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Train Name</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {train.length > 0 ? (
            train?.map((train: any) => (
              <TableRow key={train.id}>
                <TableCell>{train.trainName}</TableCell>
                <TableCell>{train.from}</TableCell>
                <TableCell>{train.to}</TableCell>
                <TableCell>
                  <Button onClick={() => onSelect(train)}>Edit</Button>
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
export default TrainList;