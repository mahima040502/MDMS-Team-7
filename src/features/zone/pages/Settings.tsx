import { useState } from "react";
import type { FormEvent } from "react";
import { useLoaderData } from "react-router-dom";
import { Input, Toggle } from "../../../shared/components/forms/Fields";
import { PageHeader } from "../../../shared/components/DataViews";
import { settingsLoader } from "../services/zoneLoaders";

const thresholds = [
  { name: "highConsumption", label: "High consumption (kWh)", step: "0.01", min: 0 },
  { name: "lowConsumption", label: "Low consumption (kWh)", step: "0.01", min: 0 },
  { name: "abnormalReadingsPerDay", label: "Abnormal readings per day", step: "1", min: 1 },
  { name: "inactiveMeterHours", label: "Inactive meter duration (hours)", step: "1", min: 1 },
] as const;

export default function Settings() {
  const settings = useLoaderData<typeof settingsLoader>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const messages: Record<string, string> = {};
    for (const threshold of thresholds) {
      const raw = data.get(threshold.name);
      const number = Number(raw);
      if (!raw || !Number.isFinite(number) || number < threshold.min) {
        messages[threshold.name] = "Enter a number of at least " + threshold.min + ".";
      } else if (threshold.step === "1" && !Number.isInteger(number)) {
        messages[threshold.name] = "Enter a whole number.";
      }
    }

    if (!messages.highConsumption && !messages.lowConsumption &&
      Number(data.get("highConsumption")) <= Number(data.get("lowConsumption"))) {
      messages.highConsumption = "High consumption must exceed low consumption.";
    }
    setErrors(messages);
    setComplete(Object.keys(messages).length === 0);
  }

  return (
    <div className="md-stack">
      <PageHeader title="Zone settings" description="Review alert thresholds and notification channels." />
      <form className="md-panel md-stack md-settings" noValidate onSubmit={submit} onChange={() => setComplete(false)}
        onReset={() => { setErrors({}); setComplete(false); }}>
        <fieldset className="md-stack">
          <legend>Alert thresholds</legend>
          <div className="md-settings-grid">
            {thresholds.map((field) => (
              <Input key={field.name} label={field.label} name={field.name} type="number"
                required min={field.min} step={field.step} defaultValue={settings[field.name]} error={errors[field.name]} />
            ))}
          </div>
        </fieldset>
        <fieldset className="md-stack">
          <legend>Notification channels</legend>
          <Toggle name="email" label="Email notifications" defaultChecked={settings.emailNotifications} />
          <Toggle name="sms" label="SMS notifications" defaultChecked={settings.smsNotifications} />
        </fieldset>
        <div className="md-actions">
          <button className="md-button" type="submit">Validate settings</button>
          <button className="md-secondary" type="reset">Reset form</button>
        </div>
        {complete && <p role="status">Settings passed validation.</p>}
      </form>
    </div>
  );
}
