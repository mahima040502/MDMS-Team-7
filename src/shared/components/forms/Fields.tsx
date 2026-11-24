import { useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

type FieldProps = { label: string; error?: string; hint?: string; id?: string };
type InputProps = FieldProps & InputHTMLAttributes<HTMLInputElement>;

function Field({ label, error, hint, id, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="md-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <small id={id + "-hint"}>{hint}</small>}
      {error && <small id={id + "-error"} className="md-error" role="alert">{error}</small>}
    </div>
  );
}

// Link the hint and validation message to the native control for screen readers.
function fieldAttributes(id: string, hint?: string, error?: string, describedBy?: string) {
  return {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": [describedBy, hint && id + "-hint", error && id + "-error"]
      .filter(Boolean).join(" ") || undefined,
  };
}

export function Input({ id, label, hint, error, ...props }: InputProps) {
  const generatedId = useId();
  const attributes = fieldAttributes(id ?? generatedId, hint, error, props["aria-describedby"]);
  return (
    <Field id={attributes.id} label={label} hint={hint} error={error}>
      <input {...props} {...attributes} />
    </Field>
  );
}

type SelectProps = FieldProps & SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
};

export function Select({ id, label, hint, error, options, ...props }: SelectProps) {
  const generatedId = useId();
  const attributes = fieldAttributes(id ?? generatedId, hint, error, props["aria-describedby"]);
  return (
    <Field id={attributes.id} label={label} hint={hint} error={error}>
      <select {...props} {...attributes}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </Field>
  );
}

export function Toggle({ id, label, hint, error, ...props }: Omit<InputProps, "type">) {
  const generatedId = useId();
  const attributes = fieldAttributes(id ?? generatedId, hint, error, props["aria-describedby"]);
  return (
    <div className="md-field md-toggle">
      <label>
        <input {...props} {...attributes} type="checkbox" role="switch" />
        {label}
      </label>
      {hint && <small id={attributes.id + "-hint"}>{hint}</small>}
      {error && <small id={attributes.id + "-error"} className="md-error" role="alert">{error}</small>}
    </div>
  );
}

export function PasswordInput({ id, label, hint, error, ...props }: Omit<InputProps, "type">) {
  const generatedId = useId();
  const [visible, setVisible] = useState(false);
  const attributes = fieldAttributes(id ?? generatedId, hint, error, props["aria-describedby"]);
  return (
    <Field id={attributes.id} label={label} hint={hint} error={error}>
      <div className="md-password">
        <input {...props} {...attributes} type={visible ? "text" : "password"} />
        <button type="button" aria-label={(visible ? "Hide " : "Show ") + label.toLowerCase()}
          aria-controls={attributes.id} onClick={() => setVisible(!visible)}>
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </Field>
  );
}
