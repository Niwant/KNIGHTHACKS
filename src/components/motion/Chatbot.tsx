"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Plus, Trash2 } from "lucide-react";
import axios from 'axios';
import FileUploadButton from "./FileUploadButton";

interface ChatbotProps {
  onFileReceived: (filename: string) => void;
  onSend: () => void;
  onAvatarUpdate: () => void;
  selectedModel?: string;
  isGenerating?: boolean;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

// API endpoints for different models
const MODEL_ENDPOINTS = {
  bamm: "https://relaxing-guiding-sailfish.ngrok-free.app",
  maskcontrol: "https://maskcontrol.ngrok.app", // TODO: Add endpoint when available
  dancemosaic: "", // TODO: Add endpoint when available
};

type EditOperation = 'prefix' | 'in-between' | 'suffix';

export default function Chatbot({ onFileReceived, onSend, onAvatarUpdate, selectedModel = 'bamm', isGenerating: externalIsGenerating = false, onGeneratingChange }: ChatbotProps) {
  const port = MODEL_ENDPOINTS[selectedModel as keyof typeof MODEL_ENDPOINTS] || MODEL_ENDPOINTS.bamm;
  const [textFields, setTextFields] = useState<string[]>([""]);
  const [submittedData, setSubmittedData] = useState<string[] | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editOperation, setEditOperation] = useState<EditOperation>('in-between');
  
  const [fileName, setFileName] = useState<string | null>(null);

  // State for new editing inputs
  const [prefixPrompt, setPrefixPrompt] = useState("");
  const [prefixDuration, setPrefixDuration] = useState(2);
  const [suffixPrompt, setSuffixPrompt] = useState("");
  const [suffixDuration, setSuffixDuration] = useState(2);
  const [inBetweenPrompt, setInBetweenPrompt] = useState("");
  const [inBetweenTime, setInBetweenTime] = useState(0);
  const [inBetweenEndTime, setInBetweenEndTime] = useState(2);


  const addTextField = (index: number) => {
    const newFields = [...textFields];
    newFields.splice(index + 1, 0, "");
    setTextFields(newFields);
  };

  const removeTextField = (index: number) => {
    if (textFields.length <= 1) return;
    const newFields = [...textFields];
    newFields.splice(index, 1);
    setTextFields(newFields);
  };

  const updateTextField = (index: number, value: string) => {
    const newFields = [...textFields];
    newFields[index] = value;
    setTextFields(newFields);
  };


// ... existing code ...

const handleInitialSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Skip text field validation for MaskControl (it doesn't use text inputs)
  if (selectedModel !== "maskcontrol" && !textFields.some(field => field.trim() !== '')) {
    return;
  }

  onGeneratingChange?.(true);
  onSend();
  const dataArray = textFields.filter(field => field.trim() !== '');
  setSubmittedData(dataArray);

  let formData: any;
  let endpoint: string;

  if (selectedModel === "maskcontrol") {
    // MaskControl - no parameters needed, just trigger
    formData = {};  // Empty payload
    endpoint = `${port}/maskcontrol/generate-avoidance`;
  } else {
    // Default BAMM or other model payload
    formData = {
      text_prompt: dataArray,
      motion_length: -1,
      repeat_times: 1,
      gpu_id: 0,
      seed: 1,
      ext: "generation_fast"
    };
    endpoint = `${port}/generate-motion`;
  }

  try {
    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Access-Control-Allow-Origin': '*',
      }
    });

    if (response.status !== 200) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = response.data;

    const filename = selectedModel === "maskcontrol"
      ? data.filename      // Use API response
      : data.filenames;

    if (filename) {
      setFileName(filename);
      localStorage.removeItem("audio_enabled");
      localStorage.removeItem("audio");
      onFileReceived(`${port}/mesh/public/${filename}`);
      if (selectedModel !== "maskcontrol") {
        setIsEditing(true); // Disable editing for maskcontrol
      }
    } else {
      console.error("No BVH files returned from backend.");
    }
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    onGeneratingChange?.(false);
  }
};
  

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratingChange?.(true);
    onSend();

    let url = '';
    let payload: any = {};

    switch(editOperation) {
      case 'prefix':
        url = port + '/add-motion-prefix';
        payload = {
          text_prompt: [prefixPrompt],
          filename: fileName,
          motion_length: prefixDuration,
        };
        break;
      case 'in-between':
        url = port + '/add-motion-inbetween';
        payload = {
          text_prompt: [inBetweenPrompt],
          filename: fileName,
          start_time: inBetweenTime,
          end_time: inBetweenEndTime,
        };
        break;
      case 'suffix':
        url = port + '/add-motion-suffix';
        payload = {
          text_prompt: [suffixPrompt],
          filename: fileName,
          motion_length: suffixDuration,
        };
        break;
    }
    
    // Common motion generation parameters
    payload = {
      ...payload,
      repeat_times: 1,
      gpu_id: 0,
      seed: 1,
      ext: "generation_fast",
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.status !== 200) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = response.data;

      if (data.filenames) {
        setFileName(data.filenames);
        localStorage.removeItem("audio_enabled"); // 🚫 prevent audio from playing
        localStorage.removeItem("audio");
        onFileReceived(`${port}/mesh/public/${data.filenames}`);
        onAvatarUpdate();
        
        // Reset input fields after successful submission
        setPrefixPrompt("");
        setInBetweenPrompt("");
        setSuffixPrompt("");

      } else {
        console.error("No BVH files returned from backend.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      onGeneratingChange?.(false);
    }
  };

  return (
    <form
      onSubmit={isEditing ? handleEditSubmit : handleInitialSubmit}
      className="w-full bg-transparent flex flex-col gap-2 relative"
    >
      <div className="bg-gradient-to-br from-zinc-900/30 via-zinc-950/20 to-zinc-900/30 backdrop-blur-sm rounded-lg p-3 border border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🎬</span>
            <span className="font-semibold text-sm text-zinc-200">{isEditing ? "Edit Motion" : "Motion Chatbot"}</span>
          </div>
          <span className="text-[11px] text-zinc-500 leading-tight">
            {isEditing 
              ? "Add new motions to the animation using the tabs below."
              : selectedModel === 'maskcontrol'
                ? "Click Generate to run MaskControl with preset avoidance constraints."
                : "Describe the motion you want to generate."}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              {/* TABS */}
              <div className="flex w-full bg-zinc-900/50 rounded-md p-0.5">
                <button type="button" onClick={() => setEditOperation('prefix')} className={`flex-1 py-1.5 text-xs font-medium rounded transition ${editOperation === 'prefix' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500'}`}>
                  Prefix
                </button>
                <button type="button" onClick={() => setEditOperation('in-between')} className={`flex-1 py-1.5 text-xs font-medium rounded transition ${editOperation === 'in-between' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500'}`}>
                  In-between
                </button>
                <button type="button" onClick={() => setEditOperation('suffix')} className={`flex-1 py-1.5 text-xs font-medium rounded transition ${editOperation === 'suffix' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500'}`}>
                  Suffix
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {editOperation === 'prefix' && (
                  <>
                    <Input value={prefixPrompt} onChange={e => setPrefixPrompt(e.target.value)} placeholder="Describe prefix motion" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 h-8 text-xs" />
                    <Input type="number" value={prefixDuration} onChange={e => setPrefixDuration(parseFloat(e.target.value) || 0)} placeholder="Duration (s)" min={0.1} step={0.1} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 h-8 text-xs" />
                  </>
                )}
                {editOperation === 'in-between' && (
                  <>
                    <Input value={inBetweenPrompt} onChange={e => setInBetweenPrompt(e.target.value)} placeholder="Describe in-between motion" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 h-8 text-xs"/>
                    <div className="flex gap-1.5">
                      <Input type="number" value={inBetweenTime} onChange={e => setInBetweenTime(parseFloat(e.target.value) || 0)} placeholder="Start (s)" min={0} step={0.1} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 h-8 text-xs" />
                      <Input type="number" value={inBetweenEndTime} onChange={e => setInBetweenEndTime(parseFloat(e.target.value) || 0)} placeholder="End (s)" min={0.1} step={0.1} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 h-8 text-xs" />
                    </div>
                  </>
                )}
                {editOperation === 'suffix' && (
                  <>
                    <Input value={suffixPrompt} onChange={e => setSuffixPrompt(e.target.value)} placeholder="Describe suffix motion" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 h-8 text-xs"/>
                    <Input type="number" value={suffixDuration} onChange={e => setSuffixDuration(parseFloat(e.target.value) || 0)} placeholder="Duration (s)" min={0.1} step={0.1} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 h-8 text-xs" />
                  </>
                )}
              </div>
            </div>
          ) : selectedModel === 'maskcontrol' ? (
            // Simple info card for MaskControl
            <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-2.5">
              <div className="flex items-start gap-2">
                <span className="text-lg">🎯</span>
                <div>
                  <h4 className="font-medium text-xs text-blue-300 mb-0.5">
                    MaskControl Generation
                  </h4>
                  <p className="text-[10px] text-blue-400/70 leading-relaxed">
                    Generates motion with spatial constraints using preset parameters
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {textFields.map((text, index) => (
                <div key={index} className="flex items-center gap-1.5 bg-zinc-900/50 border border-zinc-800/70 rounded-md px-2.5 py-1.5">
                  <Input
                    value={text}
                    onChange={(e) => updateTextField(index, e.target.value)}
                    placeholder={`A person...`}
                    className="flex-grow border-none bg-transparent focus-visible:ring-0 text-xs px-0 h-6 text-zinc-300 placeholder:text-zinc-600"
                  />
                  {textFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTextField(index)}
                      className="text-zinc-600 hover:text-red-400 transition"
                      aria-label="Remove prompt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!isEditing && selectedModel !== 'maskcontrol' && (
          <button
            type="button"
            onClick={() => addTextField(textFields.length - 1)}
            className="flex items-center gap-1 self-start text-[10px] text-blue-400 hover:text-blue-300 font-medium px-1.5 py-0.5 rounded transition"
          >
            <Plus className="w-3 h-3" /> Add prompt
          </button>
        )}

        <div className="flex gap-1.5 pt-1">
          <FileUploadButton onFileReceived={onFileReceived} />
          <Button
            type="submit"
            disabled={externalIsGenerating}
            className="flex-1 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 backdrop-blur-sm border border-white/20 hover:border-white/30 text-white py-1.5 rounded-md flex items-center justify-center gap-1.5 text-xs font-medium h-8 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
            {isEditing ? "Add Motion" : selectedModel === 'maskcontrol' ? "Generate" : "Generate"}
          </Button>
        </div>
      </div>
    </form>
  );
}