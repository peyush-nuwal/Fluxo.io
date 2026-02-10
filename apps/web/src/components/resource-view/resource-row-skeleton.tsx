import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const RowSkeleton = () => {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>

      <TableCell>
        <Skeleton className="h-3 w-48" />
      </TableCell>

      <TableCell>
        <Skeleton className="h-3 w-16" />
      </TableCell>

      <TableCell className="text-right">
        <Skeleton className="h-3 w-10 ml-auto" />
      </TableCell>

      <TableCell className="text-right">
        <Skeleton className="h-8 w-8 ml-auto rounded-md" />
      </TableCell>
    </TableRow>
  );
};

export default RowSkeleton;
