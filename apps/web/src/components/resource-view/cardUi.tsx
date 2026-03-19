import type { DiagramResource } from "@/types/diagrams";
import {
  Edit,
  EllipsisVertical,
  MountainSnow,
  Star,
  Trash,
  User2,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  resource: DiagramResource;
  selected?: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  handleDoubleClick: () => void;
};

const CardUI = ({
  resource,
  selected = false,
  menuOpen,
  onMenuOpenChange,
  onEdit,
  onDelete,
  handleDoubleClick,
}: Props) => {
  const ownerName = resource.owner_username?.trim() || "Unknown";
  const ownerAvatar = resource.owner_avatar_url?.trim();

  return (
    <div
      className={cn(
        "flex h-full w-full max-w-[320px] flex-col rounded-lg border border-solid border-border bg-card p-4 shadow transition-colors cursor-pointer",
        selected && "border-primary ring-2 ring-primary/25",
      )}
      onDoubleClick={handleDoubleClick}
    >
      <div className="relative h-36 w-full overflow-hidden rounded-md bg-secondary">
        {resource.thumbnail_url ? (
          <Image
            src={resource.thumbnail_url}
            alt={resource.name || "Diagram thumbnail"}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover object-center"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <MountainSnow className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No Thumbnail</p>
          </div>
        )}
      </div>
      {/* // data  */}
      <div className="mt-5 flex items-start gap-3">
        {/* user pfp */}
        <div className="size-10 shrink-0 overflow-hidden rounded-full">
          {ownerAvatar ? (
            <Image
              src={ownerAvatar}
              alt={ownerName}
              width={50}
              height={50}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="size-10 bg-background flex items-center justify-center border border-border border-solid rounded-full">
              <User2 className="text-muted-foreground  size-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h5 className="truncate text-sm font-medium">{resource.name}</h5>
          <p className="mt-1 flex min-w-0 items-center gap-2 text-xs">
            <span className="min-w-0 truncate">By {ownerName}</span>
            <span className="text-muted-foreground">.</span>
            <span className="flex shrink-0 items-center gap-1.5">
              <Star className="size-4 text-foreground" />
              {resource.views}
            </span>
          </p>
        </div>
        <DropdownEllipsisMenu
          className="ml-auto shrink-0"
          open={menuOpen}
          onOpenChange={onMenuOpenChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default CardUI;

type DropdownEllipsisMenuProps = {
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
};

const DropdownEllipsisMenu = ({
  className,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: DropdownEllipsisMenuProps) => {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={className}>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuItem
          onClick={() => {
            onEdit();
            onOpenChange(false);
          }}
        >
          <Edit />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await onDelete();
            onOpenChange(false);
          }}
        >
          <Trash />
          Delete
          <DropdownMenuShortcut>Del</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
