"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  ArtifactBlueprint,
  PlacedArtifact,
  selectors,
  useEditorStore,
} from "@/store/editor-store";

const AxisInput = ({
  label,
  value,
  step,
  onValueChange,
}: {
  label: string;
  value: number;
  step: number;
  onValueChange: (value: number) => void;
}) => {
  const [text, setText] = useState(value.toFixed(2));

  useEffect(() => {
    setText(value.toFixed(2));
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextText = event.target.value;
    setText(nextText);
    const parsed = parseFloat(nextText);
    if (!Number.isNaN(parsed)) {
      onValueChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed)) {
      setText(value.toFixed(2));
      return;
    }
    onValueChange(parsed);
    setText(parsed.toFixed(2));
  };

  return (
    <div className="space-y-2">
      <Label className="text-[0.7rem] font-medium uppercase tracking-[0.25em] text-zinc-400">
        {label}
      </Label>
      <Input
        value={text}
        step={step}
        onChange={handleChange}
        inputMode="decimal"
        pattern="-?[0-9]*[.,]?[0-9]*"
        onBlur={handleBlur}
        className="border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100 focus:border-blue-500 focus:ring-blue-500/20"
      />
    </div>
  );
};

export const InspectorPanel = () => {
  const placements = useEditorStore(selectors.placements);
  const blueprints = useEditorStore(selectors.blueprints);
  const selectedId = useEditorStore(selectors.selectedPlacementId);
  const updatePlacement = useEditorStore((state) => state.updatePlacement);
  const removePlacement = useEditorStore((state) => state.removePlacement);
  const clearSelection = useEditorStore((state) => state.clearSelection);

  const selection = useMemo(() => {
    const placement = placements.find((item) => item.id === selectedId);
    if (!placement) return null;
    const blueprint = blueprints.find(
      (item) => item.id === placement.blueprintId
    );
    if (!blueprint) return null;
    return { placement, blueprint };
  }, [placements, blueprints, selectedId]);

  const updatePosition = (axis: 0 | 2, value: number) => {
    if (!selection) return;
    const nextPosition = [...selection.placement.position] as PlacedArtifact["position"];
    nextPosition[axis] = value;
    updatePlacement(selection.placement.id, { position: nextPosition });
  };

  const updateScale = (axis: 0 | 1 | 2, value: number) => {
    if (!selection) return;
    const nextScale = [...selection.placement.scale] as PlacedArtifact["scale"];
    nextScale[axis] = value;
    updatePlacement(selection.placement.id, { scale: nextScale });
  };

  if (!selection) {
    return (
      <Card className="flex h-full flex-col items-center justify-center border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
        <p>Select an artifact in the scene to tune its transform and metadata.</p>
      </Card>
    );
  }

  const { blueprint, placement } = selection as {
    blueprint: ArtifactBlueprint;
    placement: PlacedArtifact;
  };
  const isFBXAsset =
    blueprint.kind === "asset" &&
    blueprint.assetPath?.toLowerCase().endsWith(".fbx");

  return (
    <Card className="flex h-full flex-col border-zinc-800/80 bg-zinc-900/50 text-zinc-200">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-400">
          Inspector
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase text-zinc-400">Blueprint</Label>
          <div className="rounded-md border border-zinc-800/80 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-400">
            <p className="font-semibold uppercase tracking-[0.25em] text-zinc-200">
              {blueprint.name}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
              <span className="font-medium">
                {blueprint.kind === "asset" ? "Asset" : blueprint.shape}
              </span>
              {blueprint.kind === "primitive" && (
                <span className="inline-flex items-center gap-1">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: blueprint.color }}
                  />
                  {blueprint.color}
                </span>
              )}
              {blueprint.kind === "asset" && blueprint.assetPath && (
                <span className="truncate text-[0.55rem] uppercase tracking-[0.35em] text-zinc-500">
                  {blueprint.assetPath}
                </span>
              )}
              <span className="ml-auto rounded-full border border-zinc-700/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.3em]">
                {blueprint.origin}
              </span>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800/60" />

        <div className="space-y-4">
          <Label className="text-xs uppercase text-zinc-400">
            Position (world)
          </Label>
          <AxisInput
            label="X"
            value={placement.position[0]}
            step={0.1}
            onValueChange={(value) => updatePosition(0, value)}
          />
          <AxisInput
            label="Z"
            value={placement.position[2]}
            step={0.1}
            onValueChange={(value) => updatePosition(2, value)}
          />
          <p className="text-[0.7rem] text-zinc-500">
            Y is constrained to keep artifacts grounded. Raise via scale if you
            need additional height.
          </p>
        </div>

        <Separator className="bg-zinc-800/60" />

        <div className="space-y-4">
          <Label className="text-xs uppercase text-zinc-400">Scale</Label>
          {isFBXAsset ? (
            <AxisInput
              label="Uniform Scale"
              value={placement.scale[0]}
              step={0.05}
              onValueChange={(value) => {
                updatePlacement(placement.id, {
                  scale: [value, value, value],
                });
              }}
            />
          ) : (
            <>
              <AxisInput
                label="X"
                value={placement.scale[0]}
                step={0.05}
                onValueChange={(value) => updateScale(0, value)}
              />
              <AxisInput
                label="Y"
                value={placement.scale[1]}
                step={0.05}
                onValueChange={(value) => updateScale(1, value)}
              />
              <AxisInput
                label="Z"
                value={placement.scale[2]}
                step={0.05}
                onValueChange={(value) => updateScale(2, value)}
              />
            </>
          )}
        </div>

        <Separator className="bg-zinc-800/60" />

        <div className="mt-auto space-y-2">
          <Button
            variant="outline"
            className="w-full border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-blue-500/60 hover:bg-blue-500/10"
            onClick={() => {
              updatePlacement(placement.id, {
                position: [0, 0.75, 0],
                scale: [1, 1, 1],
              });
            }}
          >
            Reset transform
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              removePlacement(placement.id);
              clearSelection();
            }}
          >
            Remove from scene
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
