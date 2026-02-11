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

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  resource: DiagramResource;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
};

const CardUI = ({ resource, menuOpen, onMenuOpenChange }: Props) => {
  const ownerName = resource.owner_username?.trim() || "Unknown";
  const ownerAvatar = resource.owner_avatar_url?.trim();

  return (
    <div className="rounded-lg p-4 w-full max-w-[320px] shadow bg-card border border-solid border-border">
      <div className="rounded-md bg-background w-full h-36 flex items-center justify-center overflow-hidden">
        {resource.thumbnail ? (
          <Image
            src={resource.thumbnail}
            alt=""
            width={50}
            height={50}
            className="object-fill w-full h-full "
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 ">
            <MountainSnow className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No Thumbnail</p>
          </div>
        )}
      </div>
      {/* // data  */}
      <div className="flex  mt-5 gap-3">
        {/* user pfp */}
        <div className="size-10 rounded-full overflow-hidden">
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
        <div className="flex flex-col gap-2">
          <h5 className="text-sm font-medium ">{resource.name}</h5>
          <p className="text-xs  flex items-center gap-2">
            <span>By {ownerName}</span> .{" "}
            <span className="flex items-center gap-2">
              <Star className="text-foreground size-4" />
              {resource.views}
            </span>
          </p>
        </div>
        <DropdownEllipsisMenu
          className="ml-auto"
          open={menuOpen}
          onOpenChange={onMenuOpenChange}
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
};

const DropdownEllipsisMenu = ({
  className,
  open,
  onOpenChange,
}: DropdownEllipsisMenuProps) => {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={className}>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuItem>
          <Edit />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash />
          Delete
          <DropdownMenuShortcut>Del</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
