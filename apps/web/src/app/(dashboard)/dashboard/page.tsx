"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
const page = () => {
  const { resetTheme, theme, setTheme, toggleMode, mode, setMode } = useTheme();
  return (
    <div>
      page
      <SidebarTrigger />
      <Button onClick={resetTheme}>reset</Button>
      <Button onClick={toggleMode}>
        {mode === "dark" ? "Light mode" : "Dark mode"}
      </Button>
      <Button onClick={() => setMode("light")}>Light</Button>
      <Button onClick={() => setMode("dark")}>Dark</Button>
      <Button onClick={() => setMode("system")}>System</Button>
      <div className="space-y-6 my-10 flex items-center justify-center flex-col">
        {/* ───────── Primary / Default ───────── */}
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="outline-primary">Outline Primary</Button>
          <Button variant="ghost-primary">Ghost Primary</Button>
          <Button variant="link">Link</Button>
        </div>

        {/* ───────── Secondary ───────── */}
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline-secondary">Outline Secondary</Button>
        </div>

        {/* ───────── Destructive / Danger ───────── */}
        <div className="flex flex-wrap gap-3">
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline-destructive">Outline Destructive</Button>
        </div>

        {/* ───────── Success ───────── */}
        <div className="flex flex-wrap gap-3">
          <Button variant="success">Success</Button>
          <Button variant="outline-success">Outline Success</Button>
        </div>

        {/* ───────── Sizes ───────── */}
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">Icon</Button>
          <Button size="icon-sm">Icon SM</Button>
          <Button size="icon-lg">Icon LG</Button>
        </div>

        {/* ───────── States ───────── */}
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled</Button>
          <Button variant="outline-primary" disabled>
            Disabled Outline
          </Button>
        </div>
      </div>
    </div>
  );
};

export default page;
