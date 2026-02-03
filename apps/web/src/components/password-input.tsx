import React, { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { Input } from "./ui/input";

type PasswordInputProps = React.ComponentProps<typeof Input> & {
  error?: string | null;
  containerClassName?: string;
};

const PasswordInput = ({
  error,
  containerClassName,
  className,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative ${containerClassName || ""}`}>
      <Input
        type={showPassword ? "text" : "password"}
        className={`h-10 pr-10 ${className || ""}`}
        {...props}
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground hover:text-foreground focus:outline-none"
      >
        {showPassword ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeClosed className="h-4 w-4" />
        )}
      </button>

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default PasswordInput;
