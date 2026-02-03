import { Check, X } from "lucide-react";
import React, { useEffect } from "react";

type PasswordStrengthCheckerProps = {
  password: string;
  onStrengthChange?: (isStrong: boolean) => void;
};

const PasswordStrengthChecker = ({
  password,
  onStrengthChange,
}: PasswordStrengthCheckerProps) => {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLen = password.length >= 8;

  const score =
    Number(hasUpper) +
    Number(hasLower) +
    Number(hasSpecial) +
    Number(hasMinLen) +
    Number(hasNumber);

  const isStrong = score === 5;

  useEffect(() => {
    onStrengthChange?.(isStrong);
  }, [isStrong, onStrengthChange]);

  const strengthLabel =
    score <= 1
      ? "Weak"
      : score === 2
        ? "Fair"
        : score === 3
          ? "Good"
          : score === 4
            ? "Strong"
            : "Very Strong";

  const strengthColor =
    score <= 1
      ? "bg-red-500"
      : score === 2
        ? "bg-yellow-400"
        : score === 3
          ? "bg-blue-400"
          : "bg-green-500";

  const barWidth =
    score <= 0
      ? "w-[0%]"
      : score === 1
        ? "w-[20%]"
        : score === 2
          ? "w-[40%]"
          : score === 3
            ? "w-[60%]"
            : score === 4
              ? "w-[80%]"
              : "w-[100%]";

  const itemClass = (met: boolean) => (met ? "text-green-600" : "text-red-500");

  const Icon = ({ met }: { met: boolean }) =>
    met ? (
      <span className="text-white bg-green-600 rounded-full p-0.5">
        <Check className="h-4 w-4 " />
      </span>
    ) : (
      <span className="text-white bg-red-600 rounded-full p-0.5">
        <X className="h-4 w-4 " />
      </span>
    );

  return (
    <div className="w-full flex flex-col gap-2 my-2">
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <span
          className={`h-2 block rounded-full transition-all duration-300 ${strengthColor} ${barWidth}`}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Password strength:{" "}
        <span className="font-medium text-foreground">{strengthLabel}</span>
      </p>

      <ul className="flex flex-col gap-1 text-sm">
        <li className={`flex items-center gap-2 ${itemClass(hasUpper)}`}>
          <Icon met={hasUpper} />
          At least 1 Uppercase.
        </li>
        <li className={`flex items-center gap-2 ${itemClass(hasLower)}`}>
          <Icon met={hasLower} />
          At least 1 Lowercase.
        </li>
        <li className={`flex items-center gap-2 ${itemClass(hasSpecial)}`}>
          <Icon met={hasSpecial} />
          At least 1 Special character (!@#$%^&*).
        </li>
        <li className={`flex items-center gap-2 ${itemClass(hasNumber)}`}>
          <Icon met={hasNumber} />
          At least 1 Number.
        </li>
        <li className={`flex items-center gap-2 ${itemClass(hasMinLen)}`}>
          <Icon met={hasMinLen} />
          At least 8 characters.
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthChecker;
