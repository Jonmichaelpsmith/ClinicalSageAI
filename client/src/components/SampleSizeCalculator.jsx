// /client/components/SampleSizeCalculator.jsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SampleSizeCalculator() {
  const [inputs, setInputs] = useState({ effect_size: "", std_dev: "", alpha: 0.05, power: 0.8 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setInputs({ ...inputs, [field]: value });
  };

  const handleCalculate = async () => {
    setLoading(true);
    const res = await fetch("/api/analytics/sample-size", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        effect_size: parseFloat(inputs.effect_size),
        std_dev: parseFloat(inputs.std_dev),
        alpha: parseFloat(inputs.alpha),
        power: parseFloat(inputs.power)
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="space-y-4 mt-8">
      <Card>
        <CardContent className="space-y-2 p-4">
          <h3 className="text-lg font-semibold">Sample Size Calculator</h3>

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Effect size (Δ)"
              value={inputs.effect_size}
              onChange={(e) => handleChange("effect_size", e.target.value)}
            />
            <Input
              placeholder="Standard deviation (σ)"
              value={inputs.std_dev}
              onChange={(e) => handleChange("std_dev", e.target.value)}
            />
            <Input
              placeholder="Alpha (default 0.05)"
              value={inputs.alpha}
              onChange={(e) => handleChange("alpha", e.target.value)}
            />
            <Input
              placeholder="Power (default 0.8)"
              value={inputs.power}
              onChange={(e) => handleChange("power", e.target.value)}
            />
          </div>

          <Button onClick={handleCalculate} disabled={loading}>Calculate</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-base mb-2">Required Sample Size</h4>
            <p className="text-sm">Per Group: <strong>{result.n_per_group}</strong></p>
            <p className="text-sm">Total: <strong>{result.total_sample_size}</strong></p>
            <h5 className="mt-2 text-sm font-medium">Assumptions</h5>
            <ul className="text-sm text-muted-foreground list-disc ml-5">
              <li>Δ = {result.assumptions.effect_size}</li>
              <li>σ = {result.assumptions.std_dev}</li>
              <li>Alpha = {result.assumptions.alpha}</li>
              <li>Power = {result.assumptions.power}</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}