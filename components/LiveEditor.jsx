import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X, Save, Eye, EyeOff, Type, Palette, Move, Image, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const defaultBlocks = [
  { id: "hero-heading", type: "heading", content: "Boost Your Online Reputation", visible: true, styles: { fontSize: 48, fontWeight: "700", color: "#ffffff", paddingTop: 0, paddingBottom: 16, textAlign: "center" } },
  { id: "hero-subtitle", type: "paragraph", content: "Collect more reviews, manage your reputation, and grow your business with smart NFC cards.", visible: true, styles: { fontSize: 18, fontWeight: "400", color: "#999999", paddingTop: 0, paddingBottom: 24, textAlign: "center" } },
  { id: "hero-cta", type: "button", content: "Start Free Trial", visible: true, styles: { fontSize: 16, fontWeight: "600", color: "#ffffff", paddingTop: 0, paddingBottom: 0, textAlign: "center" } },
  { id: "hero-image", type: "image", content: "/placeholder.svg", visible: true, styles: { fontSize: 0, fontWeight: "400", color: "", paddingTop: 24, paddingBottom: 0, textAlign: "center" } },
];

const LiveEditor = () => {
  const [isAdmin] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [blocks, setBlocks] = useState(defaultBlocks);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [settingsTab, setSettingsTab] = useState("typography");

  const selected = blocks.find(b => b.id === selectedBlock);

  const updateBlock = (id, updates) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const updateStyle = (id, key, value) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, styles: { ...b.styles, [key]: value } } : b));
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Floating Edit Button */}
      <AnimatePresence>
        {!editMode && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setEditMode(true)}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors glow-red"
          >
            <Pencil size={16} /> Edit Page
          </motion.button>
        )}
      </AnimatePresence>

      {/* Edit Mode Overlay */}
      <AnimatePresence>
        {editMode && (
          <>
            {/* Top Bar */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-[110] flex items-center justify-between border-b border-primary/30 bg-card/95 backdrop-blur-xl px-6 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MousePointer size={16} className="text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold">Live Edit Mode</span>
                  <span className="ml-2 text-xs text-muted-foreground">Click any highlighted block to edit</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditMode(false); setSelectedBlock(null); }}>
                  <X size={14} className="mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={() => { setEditMode(false); setSelectedBlock(null); }}>
                  <Save size={14} className="mr-1" /> Save Changes
                </Button>
              </div>
            </motion.div>

            {/* Editable Blocks Preview */}
            <div className="fixed inset-0 z-[100] pointer-events-none" style={{ top: 56 }}>
              <div className="container mx-auto px-6 pt-32 pointer-events-auto">
                <div className="max-w-3xl mx-auto space-y-4">
                  {blocks.map(block => (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlock(block.id)}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        selectedBlock === block.id
                          ? "border-primary bg-primary/5"
                          : "border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5"
                      } ${!block.visible ? "opacity-40" : ""}`}
                    >
                      <span className="absolute -top-2.5 left-3 bg-card px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {block.type}
                      </span>
                      {block.type === "heading" && (
                        <h2
                          contentEditable={selectedBlock === block.id}
                          suppressContentEditableWarning
                          onBlur={e => updateBlock(block.id, { content: e.currentTarget.textContent || "" })}
                          className="font-display outline-none"
                          style={{ fontSize: block.styles.fontSize, fontWeight: block.styles.fontWeight, color: block.styles.color, textAlign: block.styles.textAlign, paddingTop: block.styles.paddingTop, paddingBottom: block.styles.paddingBottom }}
                        >
                          {block.content}
                        </h2>
                      )}
                      {block.type === "paragraph" && (
                        <p
                          contentEditable={selectedBlock === block.id}
                          suppressContentEditableWarning
                          onBlur={e => updateBlock(block.id, { content: e.currentTarget.textContent || "" })}
                          className="outline-none"
                          style={{ fontSize: block.styles.fontSize, fontWeight: block.styles.fontWeight, color: block.styles.color, textAlign: block.styles.textAlign, paddingTop: block.styles.paddingTop, paddingBottom: block.styles.paddingBottom }}
                        >
                          {block.content}
                        </p>
                      )}
                      {block.type === "button" && (
                        <div style={{ textAlign: block.styles.textAlign }}>
                          <Button className="glow-red-hover" style={{ fontSize: block.styles.fontSize }}>
                            {block.content}
                          </Button>
                        </div>
                      )}
                      {block.type === "image" && (
                        <div style={{ textAlign: block.styles.textAlign, paddingTop: block.styles.paddingTop, paddingBottom: block.styles.paddingBottom }}>
                          <img src={block.content} alt="Editable" className="max-w-full h-auto rounded-lg inline-block max-h-64 bg-secondary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Settings Panel */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  className="fixed top-14 right-0 bottom-0 z-[120] w-80 border-l border-border/50 bg-card/95 backdrop-blur-xl overflow-y-auto"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-sm font-semibold capitalize">{selected.type} Settings</h3>
                      <button onClick={() => setSelectedBlock(null)} className="text-muted-foreground hover:text-foreground">
                        <X size={16} />
                      </button>
                    </div>

                    <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                      <TabsList className="w-full h-9">
                        <TabsTrigger value="typography" className="text-xs flex-1"><Type size={12} className="mr-1" />Type</TabsTrigger>
                        <TabsTrigger value="colors" className="text-xs flex-1"><Palette size={12} className="mr-1" />Color</TabsTrigger>
                        <TabsTrigger value="spacing" className="text-xs flex-1"><Move size={12} className="mr-1" />Space</TabsTrigger>
                      </TabsList>

                      <TabsContent value="typography" className="space-y-4 mt-4">
                        {selected.type !== "image" && (
                          <>
                            <div>
                              <Label className="text-xs">Font Size ({selected.styles.fontSize}px)</Label>
                              <Slider value={[selected.styles.fontSize]} onValueChange={v => updateStyle(selected.id, "fontSize", v[0])} min={12} max={72} step={1} className="mt-2" />
                            </div>
                            <div>
                              <Label className="text-xs">Font Weight</Label>
                              <Select value={selected.styles.fontWeight} onValueChange={v => updateStyle(selected.id, "fontWeight", v)}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {["300", "400", "500", "600", "700", "800", "900"].map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Text Align</Label>
                              <Select value={selected.styles.textAlign} onValueChange={v => updateStyle(selected.id, "textAlign", v)}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {["left", "center", "right"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        {selected.type === "image" && (
                          <div>
                            <Label className="text-xs">Image URL</Label>
                            <Input value={selected.content} onChange={e => updateBlock(selected.id, { content: e.target.value })} className="mt-1 text-xs" />
                          </div>
                        )}
                        {selected.type === "button" && (
                          <div>
                            <Label className="text-xs">Button Text</Label>
                            <Input value={selected.content} onChange={e => updateBlock(selected.id, { content: e.target.value })} className="mt-1 text-xs" />
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="colors" className="space-y-4 mt-4">
                        <div>
                          <Label className="text-xs">Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input type="color" value={selected.styles.color || "#ffffff"} onChange={e => updateStyle(selected.id, "color", e.target.value)} className="h-8 w-10 rounded border border-border cursor-pointer" />
                            <Input value={selected.styles.color} onChange={e => updateStyle(selected.id, "color", e.target.value)} className="text-xs h-8 font-mono" />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="spacing" className="space-y-4 mt-4">
                        <div>
                          <Label className="text-xs">Padding Top ({selected.styles.paddingTop}px)</Label>
                          <Slider value={[selected.styles.paddingTop]} onValueChange={v => updateStyle(selected.id, "paddingTop", v[0])} min={0} max={100} className="mt-2" />
                        </div>
                        <div>
                          <Label className="text-xs">Padding Bottom ({selected.styles.paddingBottom}px)</Label>
                          <Slider value={[selected.styles.paddingBottom]} onValueChange={v => updateStyle(selected.id, "paddingBottom", v[0])} min={0} max={100} className="mt-2" />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-6 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs flex items-center gap-2">
                          {selected.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                          Visibility
                        </Label>
                        <Switch checked={selected.visible} onCheckedChange={v => updateBlock(selected.id, { visible: v })} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveEditor;
