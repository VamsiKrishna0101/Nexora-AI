import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Normalizes and converts an image URL to Base64 via a backend proxy to bypass CORS/403.
 */
export const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;
  // Fix malformed LinkedIn URLs (LLM sometimes replaces ? with /)
  const cleanUrl = url.replace(/\/e=/, "?e=");

  try {
    const proxyUrl = `http://localhost:8000/api/proxy-image?url=${encodeURIComponent(cleanUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`Proxy returned ${response.status}`);
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result.length < 100) reject("Blob too small");
        else resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("[PDF Utility] Image proxy fetch failed:", cleanUrl, err);
    return null;
  }
};

/**
 * Captures a container of slides and generates a high-quality landscape PDF.
 * Explicitly waits for all images to decode before capturing.
 */
export const generatePDF = async (
  containerRef: React.RefObject<HTMLDivElement>,
  filename: string,
  slideSelector: string = ".ppt-slide"
) => {
  if (!containerRef.current) {
    console.error("[PDF Utility] Container ref is null");
    return;
  }

  // 1. Wait for all images in the container to be fully loaded and decoded
  const images = Array.from(containerRef.current.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      try {
        if (!img.complete) {
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }
        // Modern async decoding check
        if ("decode" in img) {
          await img.decode();
        }
      } catch (e) {
        console.warn("[PDF Utility] Image failed to decode, capturing anyway", img.src);
      }
    })
  );

  // 2. Extra tick for layout settle (give things like gradients/shadows time to render)
  await new Promise((r) => setTimeout(r, 1000));

  const slides = containerRef.current.querySelectorAll(slideSelector);
  if (slides.length === 0) {
    console.error(`[PDF Utility] No slides found with selector: ${slideSelector}`);
    return;
  }

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1122, 794],
  });

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i] as HTMLElement;
    
    // Ensure slide is visible during capture
    const originalStyle = slide.style.display;
    slide.style.display = "block";

    const canvas = await html2canvas(slide, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#FFFFFF",
      width: 1122,
      height: 794,
    });

    slide.style.display = originalStyle;

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, 1122, 794);
  }

  pdf.save(`${filename}.pdf`);
};
