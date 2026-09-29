import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { ChevronDown, Eye, EyeClosed, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface FieldWrapperProps {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/** Label + controle + mensagem de ajuda/erro, no padrão do Style Guide. */
export function FieldWrapper({ id, label, error, hint, className, children }: FieldWrapperProps) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      {label && (
        <label htmlFor={id} className="text-sm leading-5 font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {(error || hint) && (
        <p className={cn("text-xs leading-4", error ? "text-danger" : "text-gray-500")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export const controlBox = (hasError?: boolean, disabled?: boolean) =>
  cn(
    "group flex w-full items-center gap-3 overflow-hidden rounded-lg border bg-white px-[13px] py-[15px] transition-colors",
    "focus-within:border-brand",
    hasError ? "border-danger focus-within:border-danger" : "border-gray-300",
    disabled && "opacity-50",
  );

const inputText =
  "min-w-0 flex-1 bg-transparent text-base leading-[18px] text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed";

export interface TextFieldProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  prefix?: string;
  containerClassName?: string;
}

export function TextField({
  label,
  error,
  hint,
  icon: Icon,
  prefix,
  containerClassName,
  className,
  id,
  type = "text",
  disabled,
  ...props
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <FieldWrapper id={inputId} label={label} error={error} hint={hint} className={containerClassName}>
      <div className={controlBox(!!error, disabled)}>
        {Icon && (
          <Icon
            aria-hidden
            className="size-4 shrink-0 text-gray-400 group-focus-within:text-gray-700 group-has-[input:not(:placeholder-shown)]:text-gray-700"
          />
        )}
        {prefix && <span className="text-base leading-[18px] text-gray-800">{prefix}</span>}
        <input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(inputText, className)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="text-gray-700"
          >
            {showPassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
          </button>
        )}
      </div>
    </FieldWrapper>
  );
}

export interface SelectFieldProps extends ComponentProps<"select"> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export function SelectField({
  label,
  error,
  placeholder,
  options,
  containerClassName,
  className,
  id,
  value,
  ...props
}: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const isEmpty = value === "" || value === undefined;

  return (
    <FieldWrapper id={selectId} label={label} error={error} className={containerClassName}>
      <div className={cn(controlBox(!!error), "relative")}>
        <select
          id={selectId}
          value={value}
          aria-invalid={!!error}
          className={cn(
            inputText,
            "cursor-pointer appearance-none pr-6",
            isEmpty && placeholder ? "text-gray-400" : "text-gray-800",
            className,
          )}
          {...props}
        >
          {placeholder !== undefined && (
            <option value="" disabled={props.required}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-800">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-[13px] size-4 text-gray-700"
        />
      </div>
    </FieldWrapper>
  );
}
