import Gallery from "../Gallery.jsx";

function GallerySection() {
  return (
    <section
      className="gallery-section chapter-card"
      id="gallery"
      aria-label="Captured Moments"
    >
      <div className="gallery-intro">
        <h2>Captured Moments</h2>
        <p>Every frame holds a piece of our story.</p>
      </div>
      <Gallery />
    </section>
  );
}

export default GallerySection;
