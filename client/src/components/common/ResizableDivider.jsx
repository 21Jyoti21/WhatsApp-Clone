import { useEffect, useRef } from "react";
function ResizableDivider({ setSidebarWidth }) {
  const isDragging = useRef(false);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = e.clientX;
      if (newWidth >= 260 && newWidth <= 520) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "default";
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setSidebarWidth]);
  return (
    <div
      className="
        w-3
        bg-transparent
        hover:bg-secondary/20
        cursor-col-resize
        relative
        flex items-stretch justify-center
      "
      onMouseDown={() => {
        isDragging.current = true;
        document.body.style.cursor = "col-resize";
      }}
    >
      <div className="h-full w-px bg-secondary" />
    </div>
  );
}
export default ResizableDivider;