"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PlacedArtifact,
  selectors,
  useEditorStore,
} from "@/store/editor-store";

type AxisInputProps = {
  label: string;
  value: number;
  step: number;
  onValueChange: (value: number) => void;
  precision?: number;
};

const AxisInput = ({
  label,
  value,
  step,
  onValueChange,
  precision = 2,
}: AxisInputProps) => {
  const [text, setText] = useState(value.toFixed(precision));

  useEffect(() => {
    setText(value.toFixed(precision));
  }, [value, precision]);

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
      setText(value.toFixed(precision));
      return;
    }
    onValueChange(parsed);
    setText(parsed.toFixed(precision));
  };

  return (
    <div className="flex items-center gap-3">
      <Label className="w-6 text-sm font-bold text-zinc-300">{label}</Label>
      <Input
        type="number"
        value={text}
        onChange={handleChange}
        step={step}
        className="h-9 border-zinc-700 bg-zinc-900/80 text-zinc-100 focus:border-blue-500 focus:ring-blue-500/20"
        onBlur={handleBlur}
      />
    </div>
  );
};

export const PropertiesPanel = () => {
  const placements = useEditorStore(selectors.placements);
  const blueprints = useEditorStore(selectors.blueprints);
  const selectedId = useEditorStore(selectors.selectedPlacementId);
  const updatePlacement = useEditorStore((state) => state.updatePlacement);

  const selection = useMemo(() => {
    const placement = placements.find((item) => item.id === selectedId);
    if (!placement) return null;
    const blueprint = blueprints.find(
      (item) => item.id === placement.blueprintId
    );
    if (!blueprint) return null;
    const isCharacter = blueprint.kind === "asset";
    return { placement, blueprint, isCharacter };
  }, [placements, blueprints, selectedId]);

  const updatePosition = (axis: 0 | 1 | 2, value: number) => {
    if (!selection) return;
    const nextPosition = [...selection.placement.position] as PlacedArtifact["position"];
    nextPosition[axis] = value;
    updatePlacement(selection.placement.id, { position: nextPosition });
  };

  const updateScale = (axis: 0 | 1 | 2, value: number) => {
    if (!selection) return;
    // For characters/assets, apply uniform scaling
    if (selection.isCharacter) {
      updatePlacement(selection.placement.id, {
        scale: [value, value, value],
      });
    } else {
      const nextScale = [...selection.placement.scale] as PlacedArtifact["scale"];
      nextScale[axis] = value;
      updatePlacement(selection.placement.id, { scale: nextScale });
    }
  };

  const updateRotation = (axis: 0 | 1 | 2, value: number) => {
    if (!selection) return;
    const nextRotation = [...selection.placement.rotation] as PlacedArtifact["rotation"];
    // Convert degrees to radians for Three.js
    nextRotation[axis] = (value * Math.PI) / 180;
    updatePlacement(selection.placement.id, { rotation: nextRotation });
  };

  const updateUniformScale = (value: number) => {
    if (!selection) return;
    updatePlacement(selection.placement.id, {
      scale: [value, value, value],
    });
  };

  if (!selection) {
    return null;
  }

  const { blueprint, placement, isCharacter } = selection;

  return (
    <Card className="w-80 max-h-[calc(100vh-3rem)] flex flex-col border-zinc-800/80 bg-zinc-950/95 text-zinc-200 shadow-2xl backdrop-blur-sm">
      <CardHeader className="space-y-1 border-b border-zinc-800/60 pb-4 flex-shrink-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-400">
          Transform Properties
        </CardTitle>
        <p className="text-xs text-zinc-500 truncate">{blueprint.name}</p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 overflow-y-auto flex-1">
        {/* Position Controls */}
        <div className="space-y-3">
          <Label className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-zinc-400">
            Position
          </Label>
          <div className="space-y-2">
            <AxisInput
              label="X"
              value={placement.position[0]}
              step={0.1}
              onValueChange={(value) => updatePosition(0, value)}
            />
            <AxisInput
              label="Y"
              value={placement.position[1]}
              step={0.1}
              onValueChange={(value) => updatePosition(1, value)}
            />
            <AxisInput
              label="Z"
              value={placement.position[2]}
              step={0.1}
              onValueChange={(value) => updatePosition(2, value)}
            />
          </div>
        </div>

        <Separator className="bg-zinc-800/60" />

        {/* Scale Controls */}
        <div className="space-y-3">
          <Label className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-zinc-400">
            Scale {isCharacter && "(Uniform)"}
          </Label>
          {isCharacter ? (
            // Character/Asset - Single uniform scale
            <div className="flex items-center gap-3">
              <Label className="w-6 text-sm font-bold text-zinc-300">All</Label>
              <Input
                type="number"
                value={placement.scale[0].toFixed(2)}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed)) {
                    updateUniformScale(parsed);
                  }
                }}
                step={0.05}
                className="h-9 border-zinc-700 bg-zinc-900/80 text-zinc-100 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          ) : (
            // Primitive - Individual axis scaling
            <div className="space-y-2">
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
            </div>
          )}
          {isCharacter && (
            <p className="text-[0.65rem] text-zinc-600">
              Characters use uniform scaling to maintain proportions
            </p>
          )}
        </div>

        <Separator className="bg-zinc-800/60" />

        {/* Rotation Controls */}
        <div className="space-y-3">
          <Label className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-zinc-400">
            Rotation (degrees)
          </Label>
          <div className="space-y-2">
            <AxisInput
              label="X"
              value={(placement.rotation[0] * 180) / Math.PI}
              step={1}
              precision={1}
              onValueChange={(value) => updateRotation(0, value)}
            />
            <AxisInput
              label="Y"
              value={(placement.rotation[1] * 180) / Math.PI}
              step={1}
              precision={1}
              onValueChange={(value) => updateRotation(1, value)}
            />
            <AxisInput
              label="Z"
              value={(placement.rotation[2] * 180) / Math.PI}
              step={1}
              precision={1}
              onValueChange={(value) => updateRotation(2, value)}
            />
          </div>
          <p className="text-[0.65rem] text-zinc-600">
            Rotation in degrees around each axis
          </p>
        </div>

        {!isCharacter && (
          <>
            <Separator className="bg-zinc-800/60" />

            {/* Uniform Scale - Only for primitives */}
            <div className="space-y-3">
              <Label className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-zinc-400">
                Uniform Scale
              </Label>
              <div className="flex items-center gap-3">
                <Label className="w-6 text-sm font-bold text-zinc-300">All</Label>
                <Input
                  type="number"
                  value={placement.scale[0].toFixed(2)}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed)) {
                    updateUniformScale(parsed);
                  }
                }}
                step={0.05}
                className="h-9 border-zinc-700 bg-zinc-900/80 text-zinc-100 focus:border-blue-500 focus:ring-blue-500/20"
              />
              </div>
              <p className="text-[0.65rem] text-zinc-600">
                Scales all axes equally
              </p>
            </div>
          </>
        )}

        <Separator className="bg-zinc-800/60" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full border-zinc-700 bg-zinc-900 text-xs text-zinc-200 hover:border-blue-500/60 hover:bg-blue-500/10"
            onClick={() => {
              updatePlacement(placement.id, {
                position: [0, 0.75, 0],
                scale: [1, 1, 1],
                rotation: [0, 0, 0],
              });
            }}
          >
            Reset Transform
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
