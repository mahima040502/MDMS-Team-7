import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Input, Select } from "../../../shared/components/forms/Fields";
import type { Customer, Meter } from "../types/zone";

export default function MeterForm({ meter, customers, close }: {
  meter?: Meter; customers: Customer[]; close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const messages: Record<string, string> = {};
    if (!String(values.get("number") ?? "").trim()) messages.number = "Enter a meter ID.";
    if (!customers.some((customer) => String(customer.id) === values.get("owner"))) messages.owner = "Select a customer.";
    if (!String(values.get("address") ?? "").trim()) messages.address = "Enter the installation address.";
    if (!values.get("date")) messages.date = "Enter the installation date.";
    if (!values.get("tariff")) messages.tariff = "Choose a tariff category.";
    setErrors(messages);
    setComplete(Object.keys(messages).length === 0);
  }

  return (
    <dialog ref={dialog} className="md-dialog" aria-labelledby="meter-form-title" onCancel={(event) => {
      event.preventDefault();
      close();
    }}>
      <form className="md-stack" noValidate onSubmit={submit} onChange={() => setComplete(false)}>
        <h2 id="meter-form-title">{meter ? "Edit meter" : "Add meter"}</h2>
        <Input name="number" label="Meter ID" defaultValue={meter?.meterNumber} required error={errors.number} />
        <Select name="owner" label="Owner" defaultValue={meter ? String(meter.ownerId) : ""} required error={errors.owner}
          options={[{ value: "", label: "Choose a customer" },
            ...customers.map((person) => ({ value: String(person.id), label: person.name }))]} />
        <Input name="address" label="Installation address" defaultValue={meter?.address} required error={errors.address} />
        <Input name="date" label="Installed date" type="date" defaultValue={meter?.installationDate.slice(0, 10)}
          required error={errors.date} />
        <Select name="tariff" label="Tariff category" defaultValue={meter?.tariffCategory ?? ""} required error={errors.tariff}
          options={[{ value: "", label: "Choose a tariff" }, { value: "Residential", label: "Residential" },
            { value: "Commercial", label: "Commercial" }]} />
        {complete && <p role="status">Meter details passed validation.</p>}
        <div className="md-actions">
          <button className="md-button" type="submit">Validate meter</button>
          <button className="md-secondary" type="button" onClick={close}>Close</button>
        </div>
      </form>
    </dialog>
  );
}
