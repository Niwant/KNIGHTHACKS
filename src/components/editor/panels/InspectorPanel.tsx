"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArtifactBlueprint,
  PlacedArtifact,
  selectors,
  useEditorStore,
} from "@/store/editor-store";
import { Trash2, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const InspectorPanel = () => {
  const placements = useEditorStore(selectors.placements);
  const blueprints = useEditorStore(selectors.blueprints);
  const selectedId = useEditorStore(selectors.selectedPlacementId);
  const removePlacement = useEditorStore((state) => state.removePlacement);
  const selectPlacement = useEditorStore((state) => state.selectPlacement);
  const clearSelection = useEditorStore((state) => state.clearSelection);

  // Group placements by blueprint
  const groupedPlacements = useMemo(() => {
    const groups = new Map<ArtifactBlueprint, PlacedArtifact[]>();
    placements.forEach((placement) => {
      const blueprint = blueprints.find(
        (item) => item.id === placement.blueprintId
      );
      if (blueprint) {
        if (!groups.has(blueprint)) {
          groups.set(blueprint, []);
        }
        groups.get(blueprint)!.push(placement);
      }
    });
    return Array.from(groups.entries());
  }, [placements, blueprints]);

  if (placements.length === 0) {
    return (
      <Card className="flex h-full flex-col items-center justify-center border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
        <Package className="h-12 w-12 text-zinc-600 mb-4" />
        <p className="text-sm text-zinc-500">
          No artifacts in scene yet.
        </p>
        <p className="text-xs text-zinc-600 mt-2">
          Drag artifacts into the canvas or use the Artifacts tab to spawn them.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col border-zinc-800/80 bg-zinc-900/50 text-zinc-200">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-400">
          Scene Inspector
        </CardTitle>
        <p className="text-xs text-zinc-500 mt-2">
          {placements.length} artifact{placements.length !== 1 ? "s" : ""} in scene
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-3 py-2">
            {groupedPlacements.map(([blueprint, blueprintPlacements]) => (
              <div key={blueprint.id} className="space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-300">
                      {blueprint.name}
                    </h3>
                    <span className="rounded-full border border-zinc-700/60 bg-zinc-800/40 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-zinc-400">
                      {blueprintPlacements.length}
                    </span>
                  </div>
                  <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-600">
                    {blueprint.kind === "asset" ? "Asset" : blueprint.shape}
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  {blueprintPlacements.map((placement) => {
                    const isSelected = placement.id === selectedId;
                    return (
                      <div
                        key={placement.id}
                        onClick={() => selectPlacement(placement.id)}
                        className={`group flex items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? "border-blue-500/50 bg-blue-500/10"
                            : "border-zinc-800/70 bg-zinc-950/40 hover:border-zinc-700/80 hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-zinc-200">
                              Instance {blueprintPlacements.indexOf(placement) + 1}
                            </span>
                            {isSelected && (
                              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-blue-300">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-[0.7rem] text-zinc-500">
                            <span>
                              X: {placement.position[0].toFixed(1)}
                            </span>
                            <span>
                              Z: {placement.position[2].toFixed(1)}
                            </span>
                            <span>
                              Scale: {(placement.scale[0] * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlacement(placement.id);
                            if (isSelected) {
                              clearSelection();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {groupedPlacements.length > 1 && (
          <>
            <Separator className="mx-6 bg-zinc-800/60" />
            <div className="px-6 py-4">
              <p className="text-xs text-zinc-500">
                {groupedPlacements.length} unique blueprint{groupedPlacements.length !== 1 ? "s" : ""} in scene
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
