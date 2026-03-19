import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, List, Link, Code, Eye, FileCode } from "lucide-react";

const HtmlEditor = ({ value, onChange, placeholder = "Enter content...", rows = 12 }) => {
  const [mode, setMode] = useState("editor");

  const insertTag = (tag, attr = "") => {
    const textarea = document.getElementById("html-editor-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);
    const wrapped = `<${tag}${attr}>${selected}</${tag}>`;
    onChange(before + wrapped + after);
  };

  return (
    <Tabs value={mode} onValueChange={setMode} className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => insertTag("strong")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Bold"><Bold size={14} /></button>
          <button type="button" onClick={() => insertTag("em")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Italic"><Italic size={14} /></button>
          <button type="button" onClick={() => insertTag("ul")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="List"><List size={14} /></button>
          <button type="button" onClick={() => insertTag("a", ' href=""')} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Link"><Link size={14} /></button>
          <button type="button" onClick={() => insertTag("code")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Code"><Code size={14} /></button>
          <div className="w-px h-4 bg-border mx-1" />
          <button type="button" onClick={() => onChange(value + "\n<h2></h2>")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-bold" title="Heading">H2</button>
          <button type="button" onClick={() => onChange(value + "\n<h3></h3>")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-bold" title="Heading">H3</button>
          <button type="button" onClick={() => onChange(value + "\n<p></p>")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-bold" title="Paragraph">P</button>
        </div>
        <TabsList className="h-8">
          <TabsTrigger value="editor" className="text-xs h-6 px-2"><FileCode size={12} className="mr-1" />HTML</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs h-6 px-2"><Eye size={12} className="mr-1" />Preview</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="editor" className="mt-0">
        <Textarea id="html-editor-textarea" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="font-mono text-sm bg-card" />
      </TabsContent>
      <TabsContent value="preview" className="mt-0">
        <div className="min-h-[200px] p-4 rounded-md border border-border bg-card prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted-foreground">No content yet</p>' }} />
      </TabsContent>
    </Tabs>
  );
};

export default HtmlEditor;
