"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { selectors, useEditorStore } from "@/store/editor-store";

type ArtifactLibraryProps = {
  presetArtifacts?: string[];
};

export const ArtifactLibrary = ({
  presetArtifacts = [],
}: ArtifactLibraryProps) => {
  const blueprints = useEditorStore(selectors.blueprints);
  const addPlacement = useEditorStore((state) => state.addPlacement);
  const selectPlacement = useEditorStore((state) => state.selectPlacement);
  const placements = useEditorStore(selectors.placements);
  const ensureAssetBlueprint = useEditorStore(
    (state) => state.ensureAssetBlueprint
  );

  const [recentBlueprintId, setRecentBlueprintId] = useState<string | null>(
    null
  );

  const handleDoubleClick = (blueprintId: string) => {
    const blueprint = blueprints.find((item) => item.id === blueprintId);
    const spawnHeight =
      blueprint?.kind === "asset" ? 0 : 0.75;
    const placement = addPlacement(blueprintId, [0, spawnHeight, 0]);
    if (placement) {
      selectPlacement(placement.id);
      setRecentBlueprintId(blueprintId);
    }
  };

  const activeCount = useMemo(() => {
    const groups = new Map<string, number>();
    placements.forEach((placement) => {
      groups.set(
        placement.blueprintId,
        (groups.get(placement.blueprintId) ?? 0) + 1
      );
    });
    return groups;
  }, [placements]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
          Asset Library
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Drag blueprints into the viewport or double-click to spawn at the
          origin.
        </p>
      </div>
      {presetArtifacts.length > 0 && (
        <div className="space-y-3 rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3 text-sm text-zinc-300">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
            Loaded GLB Artifacts
          </p>
          <div className="flex flex-col gap-2">
            {presetArtifacts.map((artifact) => {
              const assetPath = `/artifacts/${artifact}`;
              return (
                <button
                  key={artifact}
                  type="button"
                  className="flex items-center justify-between rounded-md border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-zinc-200 transition hover:border-blue-500/60 hover:bg-blue-500/10 focus-visible:border-blue-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  onClick={() => {
                    const blueprint = ensureAssetBlueprint({
                      name: artifact.replace(/\.[^/.]+$/, ""),
                      assetPath,
                    });
                    const placement = addPlacement(blueprint.id, [0, 0, 0]);
                    if (placement) {
                      selectPlacement(placement.id);
                      setRecentBlueprintId(blueprint.id);
                    }
                  }}
                >
                  <span className="truncate">{artifact}</span>
                  <span className="text-[0.65rem] font-semibold tracking-[0.3em] text-blue-200">
                    Spawn
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <Separator className="bg-zinc-800/60" />
      <ScrollArea className="rounded-lg border border-zinc-800/80 bg-zinc-900/60">
        <div className="flex flex-col gap-3 p-3">
          {blueprints.length === 0 && (
            <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">
              Generate an artifact using a text prompt or reference image to
              populate your library.
            </div>
          )}
          {blueprints.map((blueprint) => {
            const count = activeCount.get(blueprint.id) ?? 0;
            const isRecent = recentBlueprintId === blueprint.id;
            return (
              <Card
                key={blueprint.id}
                data-state={isRecent ? "recent" : undefined}
                className="group cursor-grab select-none border-zinc-800/80 bg-zinc-900/70 text-zinc-200 transition hover:border-blue-500/50 hover:bg-zinc-800/80 active:cursor-grabbing data-[state=recent]:border-blue-500/50"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/x-blueprint",
                    blueprint.id
                  );
                  event.dataTransfer.effectAllowed = "copy";
                  setRecentBlueprintId(blueprint.id);
                }}
                onDoubleClick={() => handleDoubleClick(blueprint.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {blueprint.name}
                  </CardTitle>
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {blueprint.kind === "asset" ? "Asset" : blueprint.shape}
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-800/40 px-2 py-1 font-medium uppercase tracking-widest text-[0.65rem]">
                      {blueprint.origin}
                    </span>
                    {blueprint.kind === "primitive" && (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: blueprint.color }}
                        />
                        {blueprint.color}
                      </span>
                    )}
                    {blueprint.kind === "asset" && blueprint.assetPath && (
                      <span className="truncate text-[0.6rem] uppercase tracking-[0.3em] text-zinc-500">
                        {blueprint.assetPath}
                      </span>
                    )}
                    {count > 0 && (
                      <span className="ml-auto text-zinc-400">
                        {count} in scene
                      </span>
                    )}
                  </div>
                  {blueprint.imagePreview && (
                    <div className="relative overflow-hidden rounded-md border border-zinc-800/60">
                      <Image
                        src={blueprint.imagePreview}
                        alt={blueprint.name}
                        width={280}
                        height={160}
                        className="h-32 w-full object-cover opacity-80 transition duration-200 group-hover:opacity-100"
                        unoptimized
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-zinc-700/60 bg-zinc-800/50 text-zinc-200 hover:border-blue-500/60 hover:bg-blue-500/10"
                    onClick={() => handleDoubleClick(blueprint.id)}
                  >
                    Spawn at Origin
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
