import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";

type DownloadDiagramProps = {
  isOpen: boolean;
  close: () => void;
  onDownload: (metaData: {
    fileType: "svg" | "png" | "jpeg";
    resolution: 1 | 2 | 3;
    fileName: string;
    background: "transparent" | "canvas";
  }) => Promise<void> | void;
  isDownloading?: boolean;
};

const DEFAULT_FILE_NAME = `diagram-export-${Date.now()}`;

const DownloadDiagramForm = ({
  isOpen,
  close,
  onDownload,
  isDownloading = false,
}: DownloadDiagramProps) => {
  const [fileType, setFileType] = useState<"svg" | "png" | "jpeg">("png");
  const [resolution, setResolution] = useState<1 | 2 | 3>(2);
  const [fileName, setFileName] = useState(DEFAULT_FILE_NAME);
  const [background, setBackground] = useState<"transparent" | "canvas">(
    "canvas",
  );

  const computedName = useMemo(() => {
    const clean = fileName.trim().replace(/[\\/:*?"<>|]+/g, "-");
    return clean.length > 0 ? clean : DEFAULT_FILE_NAME;
  }, [fileName]);

  const handleDownload = async () => {
    await onDownload({
      fileType,
      resolution,
      fileName: computedName,
      background,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Diagram</DialogTitle>
          <DialogDescription>
            Choose export settings and download the current diagram.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="download-file-name">File name</FieldLabel>
            <Input
              id="download-file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={DEFAULT_FILE_NAME}
            />
          </Field>

          <Field>
            <FieldLabel>Format</FieldLabel>
            <Select
              value={fileType}
              onValueChange={(value) =>
                setFileType(value as "svg" | "png" | "jpeg")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Resolution</FieldLabel>
            <Select
              value={String(resolution)}
              onValueChange={(value) =>
                setResolution(Number(value) as 1 | 2 | 3)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="3">3x</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Background</FieldLabel>
            <Select
              value={background}
              onValueChange={(value) =>
                setBackground(value as "transparent" | "canvas")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select background" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="canvas">Canvas color</SelectItem>
                <SelectItem value="transparent">Transparent</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDiagramForm;
