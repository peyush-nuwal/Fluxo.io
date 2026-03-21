import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CustomTooltipProps = {
  children: React.ReactElement;
  content: string;
};
const CustomTooltip = ({ children, content }: CustomTooltipProps) => {
  return (
    <Tooltip delayDuration={1000}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default CustomTooltip;
